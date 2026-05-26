export interface ApiResponse<T> {
  data: T;
  meta?: { timestamp: string; source?: string };
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  timestamp: string;
}
