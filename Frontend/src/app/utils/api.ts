// API configuration and utilities

// URL base del backend al que se harán todas las peticiones
const API_BASE_URL = 'https://margery-highfalutin-unambiguously.ngrok-free.dev';

// Interfaces de las solicitudes y respuestas

// Datos que se envían al backend para iniciar sesión
export interface LoginRequest {
  institutional_email: string; // correo institucional del usuario
  password: string; // contraseña del usuario
}

// Respuesta que devuelve el backend cuando el login es exitoso
export interface LoginResponse {
  id_user: number; // id del usuario en la base de datos
  full_name: string; // nombre completo del usuario
  institutional_email: string; // correo institucional
  role_name: string; // rol del usuario (ej: admin, it, user)
  campaign?: string; // campaña del usuario (opcional)
  access_token: string; // token JWT para autenticación
  token_type: string; // tipo de token (normalmente "bearer")
}

// Datos necesarios para solicitar recuperación de contraseña
export interface PasswordRecoveryRequest {
  institutional_email: string; // correo al que se enviará el código de recuperación
}

// Datos necesarios para registrar un nuevo usuario
export interface RegisterRequest {
  full_name: string; // nombre completo
  institutional_email: string; // correo institucional
  password: string; // contraseña
  campaign: string; // campaña a la que pertenece
}

// Datos para verificar el código de recuperación enviado por email
export interface VerifyCodeRequest {
  institutional_email: string; // correo del usuario
  code: string; // código de verificación
}

// Datos para cambiar la contraseña
export interface ResetPasswordRequest {
  institutional_email: string; // correo del usuario
  code: string; // código verificado previamente
  new_password: string; // nueva contraseña
}

// Respuesta que devuelve el backend al cambiar la contraseña
export interface ResetPasswordResponse {
  message: string; // mensaje de confirmación
}


// ===============================
// Servicio de API
// ===============================

// Clase que centraliza todas las peticiones HTTP al backend
class ApiService {

  // Variable privada que almacena la URL base del backend
  private baseUrl: string;

  // Constructor que recibe la URL base
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Método genérico para hacer peticiones HTTP
  // T permite tipar la respuesta esperada
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {

    // Construye la URL completa
    const url = `${this.baseUrl}${endpoint}`;

    // Configuración de la petición
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json', // indica que se envían datos JSON
        ...options.headers, // permite agregar más headers si es necesario
      },
      ...options,
    };

    // Realiza la petición HTTP
    const response = await fetch(url, config);

    // Si la respuesta no es exitosa (status != 200-299)
    if (!response.ok) {

      // Intenta obtener el mensaje de error del backend
      const errorData = await response.json().catch(() => ({}));

      // Lanza un error con el mensaje recibido o el status HTTP
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    // Convierte la respuesta a JSON y la retorna
    return response.json();
  }


  // ===============================
  // Métodos específicos de la API
  // ===============================

  // Iniciar sesión
  async login(credentials: LoginRequest): Promise<LoginResponse> {

    // Hace un POST a /users/login con los datos del usuario
    return this.request<LoginResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Registrar usuario
  async register(data: RegisterRequest): Promise<LoginResponse> {

    // El backend devuelve un LoginResponse después del registro
    return this.request<LoginResponse>('/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Solicitar recuperación de contraseña
  async requestPasswordRecovery(request: PasswordRecoveryRequest): Promise<{ message: string }> {

    // Envía el correo para que el backend envíe un código de recuperación
    return this.request<{ message: string }>('/users/request-recovery', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Verificar código de recuperación
  async verifyCode(request: VerifyCodeRequest): Promise<{ message: string }> {

    // Verifica que el código enviado por el usuario sea válido
    return this.request<{ message: string }>('/users/verify-code', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Restablecer contraseña
  async resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {

    // Cambia la contraseña usando el código previamente verificado
    return this.request<ResetPasswordResponse>('/users/reset-password', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}


// ===============================
// Instancia del servicio de API
// ===============================

// Se exporta una instancia lista para usar en toda la aplicación
export const apiService = new ApiService(API_BASE_URL);