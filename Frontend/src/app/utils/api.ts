// API configuration and utilities
const API_BASE_URL = 'http://localhost:3006/api';

export interface LoginRequest {
  institutional_email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    role: string;
    full_name?: string;
    name?: string;
    institutional_email: string;
    campaign?: string;
  };
}

export interface RegisterResponse {
  message: string;
  userId: string;
}

export interface PasswordRecoveryRequest {
  institutional_email: string;
}

export interface RegisterRequest {
  full_name: string;
  institutional_email: string;
  password: string;
  campaign: string;
}

export interface VerifyCodeRequest {
  institutional_email: string;
  code: string;
}

export interface ResetPasswordRequest {
  institutional_email: string;
  code: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface MapObject {
  id?: string | number;
  name?: string;
  type: string;
  x: number | null;
  y: number | null;
  width: number;
  height: number;
  placed: boolean;
  isDefault: boolean;
}

export interface MapRequest {
  headquarters: string;
  floor: string;
  objects: MapObject[];
}

export interface MapResponse {
  headquarters: string;
  floor: string;
  objects: MapObject[];
}

export interface MapOptionsResponse {
  headquarters: string[];
  floors: string[];
  savedMaps?: { headquarters: string; floor: string }[];
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async requestPasswordRecovery(request: PasswordRecoveryRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>('/users/request-recovery', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async verifyCode(request: VerifyCodeRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>('/users/verify-code', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return this.request<ResetPasswordResponse>('/users/reset-password', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async saveMap(data: MapRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>('/maps/save', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async editMap(data: MapRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>('/maps/edit', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async viewMap(headquarters: string, floor: string): Promise<MapResponse> {
    return this.request<MapResponse>(`/maps/view?headquarters=${encodeURIComponent(headquarters)}&floor=${encodeURIComponent(floor)}`);
  }

  async getMapOptions(): Promise<MapOptionsResponse> {
    return this.request<MapOptionsResponse>('/maps/options');
  }
}

export const apiService = new ApiService(API_BASE_URL);