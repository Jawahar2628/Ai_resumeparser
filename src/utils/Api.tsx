const BASE_URL = "http://localhost:8000/api/v1";

export const RESUME_UPLOAD = `${BASE_URL}/resumes/upload`;
export const RESUME_LIST = `${BASE_URL}/resumes`;

export const AUTH_LOGIN = `${BASE_URL}/auth/login`;
export const AUTH_REGISTER = `${BASE_URL}/auth/register`;
export const AUTH_REFRESH = `${BASE_URL}/auth/refresh`;

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
}

export const loginUser = async (credentials: LoginPayload): Promise<AuthTokenResponse> => {
  const response = await fetch(AUTH_LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Invalid email or password");
  }

  return data;
};