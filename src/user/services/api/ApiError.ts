import { ApiError } from './HttpHelper'

const errorMessages: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'Session expired. Please login again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This record already exists.',
  422: 'Please check your input and try again.',
  429: 'Too many requests. Please wait and try again.',
  500: 'Something went wrong on our end. Please try later.',
  502: 'Server is temporarily unavailable. Please try later.',
  503: 'Service is under maintenance. Please try later.',
}

export const getApiErrorMessage = (error: any): string => {
  const apiError = error as ApiError

  if (apiError?.data?.message) {
    return apiError.data.message
  }

  if (apiError?.message) {
    return apiError.message
  }

  if (apiError?.status && errorMessages[apiError.status]) {
    return errorMessages[apiError.status]
  }

  if (apiError?.status === 0) {
    return 'Network error. Please check your internet connection.'
  }

  return 'Something went wrong. Please try again.'
}
