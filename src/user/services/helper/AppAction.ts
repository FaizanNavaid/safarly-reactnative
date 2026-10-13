import i18n from '../../config/localization/i18n'
import { store } from '../../config/redux/store/Store'
import { setTheme, ThemeMode } from '../../config/redux/slice/themeSlice'
import { setLanguage, AppLanguage } from '../../config/redux/slice/languageSlice'
import { clearUser, setUser } from '../../config/redux/slice/userSlice'
import { clearTokens } from './keychainHelper'
import { ApiService } from '../api/ApiService'
import { END_POINT } from '../api/endPoint'

export const changeAppTheme = (mode: ThemeMode): void => {
  store.dispatch(setTheme(mode))
}

export const changeAppLanguage = (language: AppLanguage): void => {
  store.dispatch(setLanguage(language))
  i18n.changeLanguage(language)
}

export const logoutUser = async (): Promise<void> => {
  await clearTokens()
  store.dispatch(clearUser())
}

let profileRequest: Promise<void> | null = null

export const fetchAndStoreProfile = async (): Promise<void> => {
  if (store.getState().user.profileLoaded) return
  if (profileRequest) return profileRequest

  profileRequest = (async () => {
    try {
      const response = await ApiService.getFromAPI<any>(END_POINT.user.profile, '')
      const profile = response?.data?.profile ?? response?.data?.user ?? response?.data?.data ?? response?.data
      if (!response?.success || !profile) return

      store.dispatch(setUser({
        firstName: profile.first_name ?? null,
        lastName: profile.last_name ?? null,
        name: `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || null,
        email: profile.email_address ?? null,
        phone: profile.phone_number ?? null,
        avatar: profile.avatar ?? null,
        profileLoaded: true,
      }))
    } catch {
    } finally {
      profileRequest = null
    }
  })()

  return profileRequest
}
