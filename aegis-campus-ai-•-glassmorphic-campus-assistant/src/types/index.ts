export type RoleMode = 'student' | 'faculty';

export type ActiveView = 'dashboard' | 'chat' | 'map' | 'schedule' | 'faculty' | 'notices';

export interface ActionChip {
  id: string;
  label: string;
  actionId: string;
  iconName?: 'map' | 'calendar' | 'mail' | 'file-text' | 'user' | 'sparkles';
  payload?: any;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionChips?: ActionChip[];
  codeSnippet?: {
    language: string;
    code: string;
  };
  attachments?: string[];
}

export interface FacultyMember {
  id: string;
  name: string;
  title: string;
  department: string;
  cabin: string;
  email: string;
  phone: string;
  status: 'in-cabin' | 'in-lecture' | 'in-meeting' | 'on-leave';
  statusDetail: string;
  avatar: string;
  officeHours: string;
  coursesTaught: string[];
  nextFreeSlot: string;
}

export interface CampusLocation {
  id: string;
  name: string;
  code: string;
  block: 'Block A' | 'Block B' | 'Block C' | 'Block D';
  floor: number;
  category: 'lab' | 'classroom' | 'auditorium' | 'amenity';
  description: string;
  capacity: number;
  features: string[];
  currentActivity?: string;
  directions: string;
  image?: string;
}

export interface ClassScheduleItem {
  id: string;
  period: number;
  time: string;
  subject: string;
  subjectCode: string;
  room: string;
  instructor: string;
  attendancePct: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  type: 'lecture' | 'lab' | 'seminar';
}

export interface CampusNotice {
  id: string;
  title: string;
  category: 'exams' | 'academics' | 'events' | 'placements';
  date: string;
  urgency: 'high' | 'normal';
  description: string;
  attachmentName?: string;
}
