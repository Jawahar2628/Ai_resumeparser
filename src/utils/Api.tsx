const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const RESUME_UPLOAD = `${BASE_URL}/resumes/upload`;
export const RESUME_LIST = `${BASE_URL}/resumes`;
export const RESUME_MATCH = `${BASE_URL}/resumes/match`;
export const RESUME_PARSED_SUMMARY = `${BASE_URL}/resumes/parsed-summary`;

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

const handleAuthError = (response: Response, resData: any) => {
  if (
    response.status === 401 ||
    resData?.detail === "Token has expired." ||
    resData?.message === "Token has expired." ||
    (typeof resData?.detail === "string" && resData.detail.toLowerCase().includes("token")) ||
    (typeof resData?.message === "string" && resData.message.toLowerCase().includes("token expired"))
  ) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Token has expired. Redirecting to login...");
  }
};

export const fetchUserProfile = async (accessToken: string): Promise<UserProfile> => {
  const response = await fetch(USER_ME, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const resData = await response.json();
  handleAuthError(response, resData);

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
  const user = await fetchUserProfile(access_token);

  return {
    access_token,
    refresh_token,
    token_type,
    user,
  };
};

export const getResumes = async (skip: number = 0, limit: number = 100) => {
  const token = localStorage.getItem("access_token") || "";
  const response = await fetch(`${RESUME_LIST}?skip=${skip}&limit=${limit}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const resData = await response.json();
  handleAuthError(response, resData);

  if (!response.ok) {
    throw new Error(resData.detail || "Failed to fetch resumes list");
  }

  return resData.data || resData;
};

export interface MatchFilterParams {
  job_title?: string;
  min_experience?: number;
  max_experience?: number;
  location?: string;
  employment_type?: string;
  year_of_passing?: string;
  skills?: string[];
}

export const matchResumes = async (params: MatchFilterParams = {}) => {
  const token = localStorage.getItem("access_token") || "";
  const queryParts: string[] = [];

  if (params.job_title) queryParts.push(`job_title=${encodeURIComponent(params.job_title)}`);
  if (params.min_experience !== undefined) queryParts.push(`min_experience=${params.min_experience}`);
  if (params.max_experience !== undefined) queryParts.push(`max_experience=${params.max_experience}`);
  if (params.location) queryParts.push(`location=${encodeURIComponent(params.location)}`);
  if (params.employment_type) queryParts.push(`employment_type=${encodeURIComponent(params.employment_type)}`);
  if (params.year_of_passing) queryParts.push(`year_of_passing=${encodeURIComponent(params.year_of_passing)}`);
  if (params.skills && params.skills.length > 0) {
    params.skills.forEach((s) => {
      if (s.trim()) queryParts.push(`skills=${encodeURIComponent(s.trim())}`);
    });
  }

  const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";

  console.log("[FRONTEND API matchResumes] Requesting URL:", `${RESUME_MATCH}${queryString}`);
  console.log("[FRONTEND API matchResumes] Filter Params:", params);

  const response = await fetch(`${RESUME_MATCH}${queryString}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const resData = await response.json();
  console.log("[FRONTEND API matchResumes] Response received:", resData);
  handleAuthError(response, resData);

  if (!response.ok) {
    throw new Error(resData.detail || "Failed to fetch matched resumes");
  }

  return resData.data || resData;
};

export const getParsedResumeSummary = async (skip: number = 0, limit: number = 100) => {
  const token = localStorage.getItem("access_token") || "";
  const response = await fetch(`${RESUME_PARSED_SUMMARY}?skip=${skip}&limit=${limit}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const resData = await response.json();
  handleAuthError(response, resData);

  if (!response.ok) {
    throw new Error(resData.detail || "Failed to fetch parsed resume summary");
  }

  return resData.data || resData;
};

export const getResumeById = async (resumeId: string) => {
  const token = localStorage.getItem("access_token") || "";
  const response = await fetch(`${RESUME_LIST}/${resumeId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const resData = await response.json();
  handleAuthError(response, resData);

  if (!response.ok) {
    throw new Error(resData.detail || "Failed to fetch resume details");
  }

  return resData.data || resData;
};
