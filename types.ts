export enum View {
  LANDING = 'LANDING',
  PROFILE = 'PROFILE',
  DASHBOARD = 'DASHBOARD',
  ATTENDANCE_PERFORMANCE = 'ATTENDANCE_PERFORMANCE',
  SINGERS = 'SINGERS',
  SONGS = 'SONGS',
  CREDENTIALS = 'CREDENTIALS',
  PERMISSIONS = 'PERMISSIONS',
  FINANCE = 'FINANCE',
}

export type Role = 'Singer' | 'Advisor' | 'President' | 'Song Conductor' | 'Secretary' | 'Accountant';

export interface User {
    id: string;
    username: string;
    name: string;
    email: string;
    phoneNumber?: string;
    profilePictureUrl?: string;
    role: Role;
    dateOfBirth: string;
    placeOfBirth: string;
    placeOfResidence: string;
    yearOfStudy: 'Year 1' | 'Year 2' | 'Year 3' | 'Year 4' | 'Year 5' | '';
    university: 'University of Rwanda' | 'East African' | '';
    gender: 'Male' | 'Female' | '';
    maritalStatus: 'Single' | 'Married' | '';
    homeParishName: string;
    homeParishLocation: {
        cell: string;
        sector: string;
        district: string;
    };
    schoolResidence: string;
    password?: string; // For storing in our pseudo-DB
    status?: 'pending' | 'approved' | 'rejected'; // User approval status
    province?: string; // Rwandan administrative divisions
    district?: string;
    sector?: string;
    cell?: string;
}

export interface Event {
  id: string;
  name: string;
  type: 'Practice' | 'Service';
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
}

export interface Song {
  id: string;
  title: string;
  composer: string;
  lyrics: string;
}

export interface PermissionRequest {
  userName: string;
  startDate: string;
  endDate: string;
  reason: string;
  details: string;
}

// FIX: Add OnboardingTask interface to be used in Onboarding.tsx component.
export interface OnboardingTask {
  title: string;
  role: string;
  type: 'Manual' | 'Form';
  created: string;
  formLink?: string;
}

export interface Announcement {
  id: string;
  type: 'general' | 'permission';
  title: string;
  author: string;
  date: string; // ISO string
  content: string;
  startTime?: string; // Optional start time
  endTime?: string; // Optional end time
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Excused' | 'No Event';
