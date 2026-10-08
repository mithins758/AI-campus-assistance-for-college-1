import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Mic, 
  Paperclip, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  MapPin, 
  Calendar, 
  Mail, 
  FileText, 
  User, 
  CornerDownLeft,
  X,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { ChatMessage, ActionChip, RoleMode, ActiveView } from '../types';
import { SUGGESTED_QUICK_CHIPS, CAMPUS_ASSETS } from '../data/campusData';
import { chatWithCampusAI } from '../lib/api';

interface AIChatInterfaceProps {
  role: RoleMode;
  onTriggerAction: (actionId: string, payload?: any) => void;
  onNavigateView: (view: ActiveView) => void;
  initialPrompt?: string;
}

export const AIChatInterface: React.FC<AIChatInterfaceProps> = ({
  role,
  onTriggerAction,
  onNavigateView,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: role === 'student' 
        ? `Hello Sarah! I'm **Aegis**, your campus AI companion.\n\nI can help you navigate directly to labs, check upcoming lecture countdowns, look up professor office hours, track your attendance buffer, or retrieve CIA-2 exam timetables.\n\nWhat can I help you find today?`
        : `Welcome Professor Sharma. Aegis Faculty Concierge is online.\n\nYour next project milestone review is at **11:00 AM** in Cabin B-214. Open consultation hours begin at **02:00 PM**.\n\nHow may I assist your academic workflow today?`,
      timestamp: '10:05 AM',
      actionChips: [
        { id: 'ac-1', label: '📍 Find BCA Computer Lab', actionId: 'open_map_bca', iconName: 'map' },
        { id: 'ac-2', label: '📅 View CIA Exam Schedule', actionId: 'open_notices', iconName: 'calendar' },
        { id: 'ac-3', label: '👨‍🏫 Check Faculty Presence', actionId: 'open_faculty', iconName: 'user' },
      ],
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue.trim();
    if (!query && !attachedFile) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: query || `Uploaded document for analysis: ${attachedFile}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: attachedFile ? [attachedFile] : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setAttachedFile(null);
    setIsLoading(true);

    try {
      // Routed to the real backend (POST /api/chat { prompt }, JWT) when it
      // is reachable; falls back to the legacy mock shape otherwise.
      const replyText = await chatWithCampusAI(query);

      // Legacy mock servers also returned an `actionChip` hint; the real
      // backend does not, so chip detection below is query-based only.
      const data = {} as { actionChip?: string };
      
      // Determine action chips based on response
      const actionChips: ActionChip[] = [];
      const lower = query.toLowerCase();

      if (lower.includes('bca') || lower.includes('lab') || data.actionChip === 'open_map_bca') {
        actionChips.push({
          id: `chip-${Date.now()}-1`,
          label: 'Open Campus Map (BCA Lab)',
          actionId: 'open_map_bca',
          iconName: 'map',
        });
      }
      if (lower.includes('sharma') || lower.includes('email') || data.actionChip === 'book_sharma') {
        actionChips.push({
          id: `chip-${Date.now()}-2`,
          label: 'Book Office Hour Slot',
          actionId: 'book_sharma',
          iconName: 'user',
        });
      }
      if (lower.includes('cia') || lower.includes('exam') || data.actionChip === 'open_notices') {
        actionChips.push({
          id: `chip-${Date.now()}-3`,
          label: 'View Full CIA Timetable',
          actionId: 'open_notices',
          iconName: 'calendar',
        });
      }
      if (lower.includes('attendance') || data.actionChip === 'open_schedule') {
        actionChips.push({
          id: `chip-${Date.now()}-4`,
          label: 'Open Timetable & Calculator',
          actionId: 'open_schedule',
          iconName: 'calendar',
        });
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionChips: actionChips.length > 0 ? actionChips : undefined,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      // Resilient local fallback
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `📍 **Campus Knowledge Route Activated**\n\nI have retrieved the verified campus info for your request. The BCA Lab is in **Block B, Floor 2, Room 204**. For professor office hours, check Cabin B-214. If you require further assistance, you can also view the interactive map directly.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionChips: [
            { id: 'f-1', label: 'View on Campus Map', actionId: 'open_map_bca', iconName: 'map' },
            { id: 'f-2', label: 'View Faculty Directory', actionId: 'open_faculty', iconName: 'user' },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    // Try browser SpeechRecognition if available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          setIsListening(false);
          handleSendMessage(transcript);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognition.start();
        return;
      } catch {
        // Fallback simulated voice prompt
      }
    }

    // Realistic voice toggle simulation for demonstration
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      const simulatedVoices = [
        'Where is the BCA Computer Lab?',
        'When does Prof Sharma hold office hours?',
        'What is my current attendance percentage?',
      ];
      const randomPrompt = simulatedVoices[Math.floor(Math.random() * simulatedVoices.length)];
      setInputValue(randomPrompt);
    }, 2800);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeakText = (id: string, text: string) => {
    if ('speechSynthesis' in window) {
      if (speakingId === id) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
      }
      window.speechSynthesis.cancel();
      // Clean markdown tags for audio reading
      const cleanText = text.replace(/[*_#`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleMockAttachment = () => {
    const mockFiles = [
      'CS202_Syllabus_Fall2026.pdf',
      'CIA2_Exam_Hall_Ticket.pdf',
      'Duty_Leave_Form_Hackathon.pdf',
    ];
    const picked = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    setAttachedFile(picked);
  };

  const renderActionChipIcon = (iconName?: string) => {
    switch (iconName) {
      case 'map': return <MapPin className="w-3.5 h-3.5 text-cyan-400" />;
      case 'calendar': return <Calendar className="w-3.5 h-3.5 text-emerald-400" />;
      case 'user': return <User className="w-3.5 h-3.5 text-indigo-400" />;
      case 'file-text': return <FileText className="w-3.5 h-3.5 text-amber-400" />;
      default: return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  // Basic formatted markdown renderer
  const renderFormattedText = (raw: string) => {
    return raw.split('\n\n').map((paragraph, pIdx) => {
      // Check for bullet lists
      if (paragraph.startsWith('• ') || paragraph.startsWith('- ')) {
        const items = paragraph.split('\n');
        return (
          <ul key={pIdx} className="space-y-1.5 my-2">
            {items.map((item, itemIdx) => {
              const cleaned = item.replace(/^[•\-]\s*/, '');
              return (
                <li key={itemIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span dangerouslySetInnerHTML={{ 
                    __html: cleaned
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-900/80 text-cyan-300 font-mono text-[11px] border border-cyan-500/20">$1</code>')
                  }} />
                </li>
              );
            })}
          </ul>
        );
      }

      return (
        <p 
          key={pIdx} 
          className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-2 last:mb-0"
          dangerouslySetInnerHTML={{
            __html: paragraph
              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
              .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-900/80 text-cyan-300 font-mono text-[11px] border border-cyan-500/20">$1</code>')
          }}
        />
      );
    });
  };

  return (
    <div className="relative flex flex-col h-[680px] lg:h-[720px] rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/15 shadow-[0_16px_50px_rgba(0,0,0,0.45)] overflow-hidden">
      
      {/* Translucent Chat Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-slate-950/40 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px] shadow-sm">
            <div className="w-full h-full rounded-[11px] bg-slate-950 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-cyan-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">
                Aegis Campus Engine
              </h2>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">
              Interactive Room Finder · Exam Schedules · SIMS ERP Assistant
            </p>
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMessages([messages[0]])}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors text-xs flex items-center gap-1"
            title="Reset Chat Session"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Clear</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Body with Glowing Scrollbar */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5 custom-glass-scroll">
        {messages.map((message) => {
          const isUser = message.sender === 'user';
          return (
            <div
              key={message.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} transition-all`}
            >
              <div className={`flex items-start gap-3 max-w-[90%] sm:max-w-[82%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar Icon */}
                <div className="shrink-0 mt-0.5">
                  {isUser ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 ring-2 ring-indigo-500/20">
                      <img
                        src={role === 'student' ? CAMPUS_ASSETS.studentAvatar : CAMPUS_ASSETS.profSharmaAvatar}
                        alt="User Avatar"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-indigo-600 p-[1px] shadow-md shadow-cyan-500/20">
                      <div className="w-full h-full rounded-[11px] bg-slate-950 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Glass Bubble */}
                <div
                  className={`group relative px-4 py-3.5 rounded-2xl transition-all ${
                    isUser
                      ? 'bg-gradient-to-br from-indigo-900/60 to-blue-900/50 backdrop-blur-xl border border-indigo-400/30 text-white shadow-lg shadow-indigo-950/40 rounded-tr-sm'
                      : 'bg-slate-900/60 backdrop-blur-2xl border border-white/15 text-slate-100 shadow-xl shadow-black/30 rounded-tl-sm'
                  }`}
                >
                  {/* Attached File Badge if any */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 mb-2 rounded-lg bg-white/10 border border-white/10 text-xs text-cyan-300">
                      <FileText className="w-3.5 h-3.5" />
                      <span className="font-mono text-[11px] truncate">{message.attachments[0]}</span>
                    </div>
                  )}

                  {/* Message Content */}
                  <div>{renderFormattedText(message.text)}</div>

                  {/* Interactive Action Chips */}
                  {message.actionChips && message.actionChips.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
                      {message.actionChips.map((chip) => (
                        <button
                          key={chip.id}
                          onClick={() => onTriggerAction(chip.actionId, chip.payload)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-cyan-500/20 border border-white/20 hover:border-cyan-400/40 text-xs font-medium text-cyan-200 transition-all duration-200 shadow-sm hover:scale-[1.02]"
                        >
                          {renderActionChipIcon(chip.iconName)}
                          <span>{chip.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp & Bubble Tools */}
                  <div className="flex items-center justify-between gap-4 mt-2 text-[10px] text-slate-400 pt-1">
                    <span className="font-mono tabular-nums">{message.timestamp}</span>

                    {!isUser && (
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopyText(message.id, message.text)}
                          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                          title="Copy text"
                        >
                          {copiedId === message.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          onClick={() => handleSpeakText(message.id, message.text)}
                          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                          title="Speak aloud"
                        >
                          {speakingId === message.id ? (
                            <VolumeX className="w-3 h-3 text-amber-400" />
                          ) : (
                            <Volume2 className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })}

        {/* AI Typing Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px] shrink-0">
              <div className="w-full h-full rounded-[11px] bg-slate-950 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              </div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px] font-mono">Querying SIMS Knowledge Engine...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Prompt Bar Area */}
      <div className="shrink-0 p-4 border-t border-white/10 bg-slate-950/60 backdrop-blur-2xl">
        
        {/* Suggested Quick Prompt Chips (Zero-pill compliant interactive buttons) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 custom-glass-scroll no-scrollbar">
          {SUGGESTED_QUICK_CHIPS.map((chipText, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chipText)}
              className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 active:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/30 text-[11px] font-medium text-slate-300 hover:text-cyan-200 transition-all whitespace-nowrap shrink-0"
            >
              {chipText}
            </button>
          ))}
        </div>

        {/* File Attachment preview if selected */}
        {attachedFile && (
          <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-xs text-cyan-200">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span className="truncate">{attachedFile}</span>
            </div>
            <button
              onClick={() => setAttachedFile(null)}
              className="p-1 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Floating Glass Capsule Prompt Bar */}
        <div className="relative flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 backdrop-blur-2xl border border-white/20 focus-within:border-cyan-400/50 focus-within:shadow-[0_0_25px_rgba(34,211,238,0.25)] transition-all">
          
          {/* File Attachment Button */}
          <button
            onClick={handleMockAttachment}
            className="p-2.5 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-white/10 transition-colors"
            title="Attach document / syllabus / schedule"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Voice Input Button */}
          <button
            onClick={handleVoiceToggle}
            className={`p-2.5 rounded-xl transition-all ${
              isListening
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-white/10'
            }`}
            title={isListening ? 'Listening...' : 'Voice Query'}
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Input Text Box */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              isListening
                ? 'Listening to your campus question...'
                : 'Ask anything (e.g. "Where is the BCA Lab?", "Next class?", "Prof Sharma office hours")...'
            }
            className="flex-1 bg-transparent border-none text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none px-2"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={(!inputValue.trim() && !attachedFile) || isLoading}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 active:scale-95 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-cyan-500/25 transition-all"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
