import httpProvider from './HttpProvider'
import {
  ApiResponse,
  buildHeaders,
  buildFormDataHeaders,
  handleApiError,
} from './HttpHelper'

export class ApiService {
  static async getFromAPI<T = any>(
    endpoint: string,
    token: string,
    params?: Record<string, any>,
  ): Promise<ApiResponse<T>> {
    try {
      const res = await httpProvider.get<ApiResponse<T>>(endpoint, {
        headers: buildHeaders(token),
        params,
      })
      return res.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async postFromAPI<T = any>(
    endpoint: string,
    payload: any,
    token: string,
  ): Promise<ApiResponse<T>> {
    try {
      const res = await httpProvider.post<ApiResponse<T>>(endpoint, payload, {
        headers: buildHeaders(token),
      })
      return res.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async putFromAPI<T = any>(
    endpoint: string,
    payload: any,
    token: string,
  ): Promise<ApiResponse<T>> {
    try {
      const res = await httpProvider.put<ApiResponse<T>>(endpoint, payload, {
        headers: buildHeaders(token),
      })
      return res.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async patchFromAPI<T = any>(
    endpoint: string,
    payload: any,
    token: string,
  ): Promise<ApiResponse<T>> {
    try {
      const res = await httpProvider.patch<ApiResponse<T>>(endpoint, payload, {
        headers: buildHeaders(token),
      })
      return res.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async deleteFromAPI<T = any>(
    endpoint: string,
    token: string,
    payload?: any,
  ): Promise<ApiResponse<T>> {
    try {
      const res = await httpProvider.delete<ApiResponse<T>>(endpoint, {
        headers: buildHeaders(token),
        data: payload,
      })
      return res.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async uploadFromAPI<T = any>(
    endpoint: string,
    formData: FormData,
    token: string,
  ): Promise<ApiResponse<T>> {
    try {
      const res = await httpProvider.post<ApiResponse<T>>(endpoint, formData, {
        headers: buildFormDataHeaders(token),
      })
      return res.data
    } catch (error) {
      return handleApiError(error)
    }
  }
}