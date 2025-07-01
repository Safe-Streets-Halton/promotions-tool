export interface User {
  id: string
  email: string
  created_at: string
  email_confirmed_at?: string
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: User
  error?: string
}
