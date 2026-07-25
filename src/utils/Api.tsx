const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const RESUME_UPLOAD = `${BASE_URL}/resumes/upload`;
export const RESUME_LIST = `${BASE_URL}/resumes`;

export const AUTH_LOGIN = `${BASE_URL}/auth/login`;
export const AUTH_REGISTER = `${BASE_URL}/auth/register`;
export const AUTH_REFRESH = `${BASE_URL}/auth/refresh`;

export const USER_ME = `${BASE_URL}/users/me`;

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginApiResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in_minutes: number;
  };
}

export interface AuthSuccessResult {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserProfile;
}

export const fetchUserProfile = async (accessToken: string): Promise<UserProfile> => {
  const response = await fetch(USER_ME, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const resData = await response.json();

  if (!response.ok) {
    throw new Error(resData.detail || "Failed to fetch user profile");
  }

  // Handle standard envelope or direct object return
  return resData.data || resData;
};

export const loginUser = async (credentials: LoginPayload): Promise<AuthSuccessResult> => {
  const response = await fetch(AUTH_LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const resData: LoginApiResponse = await response.json();

  if (!response.ok || !resData.success) {
    throw new Error((resData as any).detail || resData.message || "Invalid email or password");
  }

  const { access_token, refresh_token, token_type } = resData.data;

  // Fetch full user profile using access token
  const user = await fetchUserProfile(access_token);

  return {
    access_token,
    refresh_token,
    token_type,
    user,
  };
};
