/** Envelope shape returned by the NestJS backend */
export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  error: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

/** Envelope returned by the Shell BFF routes /api/auth/* */
export interface AuthRouteResponse {
  success: boolean;
  user?: AuthUser;
  message?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  isActive: boolean;
}

export interface UserRouteResponse {
  success: boolean;
  user?: UserProfile;
  avatarUrl?: string;
  message?: string;
}
