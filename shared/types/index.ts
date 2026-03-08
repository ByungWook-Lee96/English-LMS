export type Role = 'TEACHER' | 'MASTER';

export type AttendStatus = 'PRESENT' | 'ABSENT' | 'NOSHOW' | 'SUBSTITUTE';

export interface User {
  id: number;
  username: string;
  role: Role;
  createdAt: Date;
  teacher?: Teacher;
}

export interface Teacher {
  id: number;
  userId: number;
  name: string;
  createdAt: Date;
  user?: User;
  students?: Student[];
  schedules?: Schedule[];
}

export interface Student {
  id: number;
  nameKo: string;
  nameEn: string;
  phone: string;
  age?: number | null;
  studyGoal?: string | null;
  textbook?: string | null;
  extraInfo?: string | null;
  totalSessions: number;
  teacherId?: number | null;
  createdAt: Date;
  updatedAt: Date;
  memos?: Memo[];
  schedules?: Schedule[];
  teacher?: Teacher | null;
}

export interface Memo {
  id: number;
  studentId: number;
  content: string;
  createdAt: Date;
  student?: Student;
}

export interface Schedule {
  id: number;
  studentId: number;
  teacherId: number;
  dateTime: Date;
  status: AttendStatus;
  note?: string | null;
  createdAt: Date;
  updatedAt: Date;
  student?: Student;
  teacher?: Teacher;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
