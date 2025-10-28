import api from './api';

export type LogType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'EMPLOYEE_CREATED'
  | 'PASSWORD_CHANGED'
  | 'PASSWORD_RESET'
  | 'ACCOUNT_BLOCKED'
  | 'ACCOUNT_UNBLOCKED';

export interface AuditLogDto {
  _id: string;
  type: LogType;
  userType: 'user' | 'employee';
  userId?: string;
  email?: string;
  name?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface GetLogsParams {
  type?: string; // comma separated
  userType?: 'user' | 'employee';
  email?: string;
  start?: string; // ISO
  end?: string; // ISO
  page?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
}

export const logsApi = {
  getLogs: (params: GetLogsParams) => api.get('/api/logs', { params }),
};
