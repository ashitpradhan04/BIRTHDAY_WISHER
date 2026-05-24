// src/app/shared/models/user.model.ts

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  birthday: string;
  timezone?: string;
  customMessage?: string;
  notificationPreference: 'EMAIL' | 'SMS' | 'BOTH';
  role: 'USER' | 'ADMIN';
  active: boolean;
  age: number;
  daysUntilBirthday: number;
  isBirthdayToday: boolean;
  createdAt: string;
  lastWishedAt?: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  birthday: string;
  timezone?: string;
  customMessage?: string;
  notificationPreference?: 'EMAIL' | 'SMS' | 'BOTH';
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  birthday?: string;
  timezone?: string;
  customMessage?: string;
  notificationPreference?: 'EMAIL' | 'SMS' | 'BOTH';
  active?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  birthdaysToday: number;
  upcomingBirthdays: number;
  notificationsSent: number;
  notificationsFailed: number;
}

export interface NotificationLog {
  id: number;
  userId: number;
  userName: string;
  type: 'EMAIL' | 'SMS';
  status: 'SENT' | 'FAILED' | 'SKIPPED';
  message?: string;
  errorMessage?: string;
  recipient: string;
  sentAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
}
