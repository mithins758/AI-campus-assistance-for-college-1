#!/usr/bin/env python3
"""Run the Campus Management stack (database + backend + frontend) with one command.

Usage:
    python3 run.py                 # start everything (dev mode)
    python3 run.py --no-db         # skip embedded DB, use your own DATABASE_URL
    python3 run.py --install       # npm install both apps first
    python3 run.py --force         # kill stale processes on the ports first
    python3 run.py --backend-port 5001 --frontend-port 3000

Ctrl+C stops everything cleanly. Only the Python standard library is used.
"""

import argparse
import os
import signal
import socket
import subprocess
import sys
import threading
import time
import urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT, "backend")
FRONTEND_DIR = os.path.join(ROOT, "aegis-campus-ai-•-glassmorphic-campus-assistant")
# Embedded-Postgres sandbox created during local verification (optional).
EMBEDDED_DIR = "/private/var/folders/2q/8y32w9cn5kb8m2jq8y1tgx2w0000gn/T/pgtest"

children = []  # subprocess.Popen objects, cleaned up on exit


def log(tag, msg):
    print("[%s] %s" % (tag, msg), flush=True)


def read_dotenv(path):
    values = {}
    if not os.path.exists(path):
        return values
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, val = line.split("=", 1)
            values[key.strip()] = val.strip().strip("'\"")
    return values


def parse_db_target(database_url):
    """Return (host, port) from a postgresql://... URL, or (None, None)."""
    try:
        rest = database_url.split("://", 1)[1]
        if "@" in rest:
            rest = rest.split("@", 1)[1]
        hostport = rest.split("/", 1)[0]
        if ":" in hostport:
            host, port = hostport.rsplit(":", 1)
            return host, int(port)
        return hostport, 5432
    except Exception:
        return None, None


def tcp_open(host, port, timeout=2):
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False


def http_ok(url, timeout=3):
    try:
        with urllib.request.urlopen(url, timeout=timeout) as res:
            return 200 <= res.status < 500
    except Exception:
        return False


def wait_for(name, check, timeout, tag):
    deadline = time.time() + timeout
    while time.time() < deadline:
        if check():
            log(tag, "%s is up" % name)
            return True
        time.sleep(1)
    return False


def spawn(tag, cmd, cwd, env_extra):
    env = dict(os.environ)
    env.update(env_extra)
    proc = subprocess.Popen(
        cmd,
        cwd=cwd,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        start_new_session=True,  # own process group so we can kill the tree
    )
    children.append((tag, proc))
    return proc


def stream_output(tag, proc):
    """Pump one process's output to stdout with a [tag] prefix (blocking)."""
    try:
        for line in proc.stdout:
            print("[%s] %s" % (tag, line.rstrip()), flush=True)
    except Exception:
        pass


def kill_stale(port):
    try:
        out = subprocess.run(
            ["lsof", "-ti:%d" % port], capture_output=True, text=True
        ).stdout.strip()
    except FileNotFoundError:
        return
    for pid in out.split():
        try:
            os.kill(int(pid), signal.SIGKILL)
            log("run", "killed stale pid %s on port %d" % (pid, port))
        except (ProcessLookupError, ValueError):
            pass


def shutdown(signum=None, frame=None):
    log("run", "shutting down...")
    for tag, proc in children:
        if proc.poll() is None:
            try:
                os.killpg(proc.pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
    time.sleep(2)
    for tag, proc in children:
        if proc.poll() is None:
            try:
                os.killpg(proc.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
    sys.exit(0)


def main():
    ap = argparse.ArgumentParser(description="Run the Campus Management stack.")
    ap.add_argument("--backend-port", type=int, default=5001)
    ap.add_argument("--frontend-port", type=int, default=3000)
    ap.add_argument("--no-db", action="store_true",
                    help="don't start the embedded DB sandbox")
    ap.add_argument("--install", action="store_true",
                    help="run npm install in both apps first")
    ap.add_argument("--force", action="store_true",
                    help="kill stale processes on the ports first")
    args = ap.parse_args()

    for sig in (signal.SIGINT, signal.SIGTERM):
        signal.signal(sig, shutdown)

    if args.force:
        kill_stale(args.backend_port)
        kill_stale(args.frontend_port)
        time.sleep(1)

    # --- sanity checks -----------------------------------------------------
    for label, path in (("backend", BACKEND_DIR), ("frontend", FRONTEND_DIR)):
        if not os.path.isdir(path) or not os.path.exists(
            os.path.join(path, "package.json")
        ):
            sys.exit("[run] FATAL: %s app not found at %s" % (label, path))

    env_path = os.path.join(BACKEND_DIR, ".env")
    if not os.path.exists(env_path):
        example = os.path.join(BACKEND_DIR, ".env.example")
        if os.path.exists(example):
            with open(example) as src, open(env_path, "w") as dst:
                dst.write(src.read())
            log("run", "created backend/.env from .env.example — "
                       "fill in DATABASE_URL / JWT_SECRET / GEMINI_API_KEY")
        else:
            sys.exit("[run] FATAL: backend/.env missing and no .env.example")
    env_vals = read_dotenv(env_path)
    if not env_vals.get("GEMINI_API_KEY"):
        log("run", "WARNING: GEMINI_API_KEY not set — /api/chat will 503")

    if args.install:
        for label, path in (("backend", BACKEND_DIR),
                            ("frontend", FRONTEND_DIR)):
            log("run", "npm install (%s)..." % label)
            rc = subprocess.run(["npm", "install"], cwd=path).returncode
            if rc != 0:
                sys.exit("[run] FATAL: npm install failed for %s" % label)

    backend_url = "http://localhost:%d" % args.backend_port

    # --- 1. database -------------------------------------------------------
    if not args.no_db:
        run_pg = os.path.join(EMBEDDED_DIR, "run-pg.js")
        if os.path.exists(run_pg) and os.path.exists(
            os.path.join(EMBEDDED_DIR, "node_modules")
        ):
            db_host, db_port = parse_db_target(
                env_vals.get("DATABASE_URL", ""))
            if db_host and tcp_open(db_host, db_port or 5433):
                log("db", "already reachable at %s:%s" % (db_host, db_port))
            else:
                log("db", "starting embedded PostgreSQL...")
                spawn("db", ["node", "run-pg.js"], EMBEDDED_DIR, {})
                if not wait_for(
                    "embedded PostgreSQL",
                    lambda: tcp_open(db_host or "localhost", db_port or 5433),
                    60, "db",
                ):
                    sys.exit("[run] FATAL: embedded DB did not start")
        else:
            log("db", "no embedded sandbox found — expecting your own "
                      "Postgres at DATABASE_URL")

    # --- 2. backend --------------------------------------------------------
    log("api", "starting backend on :%d..." % args.backend_port)
    api = spawn("api", ["npm", "run", "dev"], BACKEND_DIR,
                {"PORT": str(args.backend_port)})
    threading.Thread(target=stream_output, args=("api", api),
                     daemon=True).start()
    if not wait_for("backend", lambda: http_ok(
            "http://localhost:%d/health" % args.backend_port), 45, "api"):
        sys.exit("[run] FATAL: backend did not become healthy — "
                 "check backend/.env DATABASE_URL")

    # --- 3. frontend -------------------------------------------------------
    log("web", "starting frontend on :%d (BACKEND_URL=%s)..."
        % (args.frontend_port, backend_url))
    web = spawn("web", ["npm", "run", "dev"], FRONTEND_DIR,
                {"PORT": str(args.frontend_port),
                 "BACKEND_URL": backend_url})
    threading.Thread(target=stream_output, args=("web", web),
                     daemon=True).start()
    if not wait_for("frontend", lambda: http_ok(
            "http://localhost:%d/" % args.frontend_port), 90, "web"):
        log("web", "WARNING: frontend not responding yet — still starting?")

    print("", flush=True)
    log("run", "STACK UP  →  app: http://localhost:%d  |  api: %s"
        % (args.frontend_port, backend_url))
    log("run", "demo login: mithin@example.com / Password123!  (Ctrl+C to stop)")

    while True:
        time.sleep(1)
        for tag, proc in children:
            if proc.poll() is not None:
                log("run", "FATAL: [%s] exited (code %s) — stopping stack"
                    % (tag, proc.returncode))
                shutdown()


if __name__ == "__main__":
    main()
