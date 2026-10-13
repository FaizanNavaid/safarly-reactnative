export interface ApiResponse<T = any> {
  data: T
  status: number
  message: string
  success: boolean
}

export interface ApiError {
  status: number
  message: string
  data: any
}

export const buildHeaders = (token: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export const buildFormDataHeaders = (token: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'multipart/form-data',
    Accept: 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export const handleApiError = (error: any): never => {
  if (error.response) {
    throw {
      status: error.response.status,
      message: error.response.data?.message ?? 'Server error occurred.',
      data: error.response.data ?? null,
    } as ApiError
  }
  if (error.request) {
    throw {
      status: 0,
      message: 'Network error. Please check your connection.',
      data: null,
    } as ApiError
  }
  throw {
    status: 0,
    message: error.message ?? 'An unexpected error occurred.',
    data: null,
  } as ApiError
}