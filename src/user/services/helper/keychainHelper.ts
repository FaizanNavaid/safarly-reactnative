import * as Keychain from 'react-native-keychain'

const AUTH_SERVICE = 'com.safarly.auth'
const REFRESH_SERVICE = 'com.safarly.refresh'

export const saveToken = async (token?: string, refreshToken?: string): Promise<void> => {
  if (token) {
    await Keychain.setGenericPassword('token', token, { service: AUTH_SERVICE })
  }
  if (refreshToken) {
    await Keychain.setGenericPassword('refresh_token', refreshToken, {
      service: REFRESH_SERVICE,
    })
  }
}

export const getToken = async (): Promise<string | null> => {
  const credentials = await Keychain.getGenericPassword({ service: AUTH_SERVICE })
  return credentials ? credentials.password : null
}

export const getRefreshToken = async (): Promise<string | null> => {
  const credentials = await Keychain.getGenericPassword({ service: REFRESH_SERVICE })
  return credentials ? credentials.password : null
}

export const clearTokens = async (): Promise<void> => {
  await Keychain.resetGenericPassword({ service: AUTH_SERVICE })
  await Keychain.resetGenericPassword({ service: REFRESH_SERVICE })
}