import { useEffect } from 'react'
import { StatusBar, StyleSheet, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../services/style/theme/useTheme'
import { ThemeColors } from '../../services/style/color/color'
import { getData, scale } from '../../services/helper/helper'
import { getToken } from '../../services/helper/keychainHelper'
import { SCREEN } from '../../services/screen-names/ScreenName'
import { store } from '../../config/redux/store/Store'
import { setToken, setUser } from '../../config/redux/slice/userSlice'
import { ApiService } from '../../services/api/ApiService'
import { END_POINT } from '../../services/api/endPoint'

export default function Splash() {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = getStyles(theme)
  const navigation = useNavigation<any>()

  const fetchProfile = async (accessToken: string) => {
    try {
      const res = await ApiService.getFromAPI<any>(END_POINT.auth.profile, accessToken)
      if (res?.success) {
        const data: any = res.data
        const profile = data?.profile ?? data?.user ?? data
        const fn = profile?.firstName || ''
        const ln = profile?.lastName || ''
        store.dispatch(setUser({
          firstName: fn,
          lastName: ln,
          name: `${fn} ${ln}`.trim() || null,
          email: profile?.email ?? null,
          phone: profile?.phone ?? null,
          avatar: profile?.profilePicture ?? null,
          isVerified: profile?.isVerified ?? null,
          createdAt: profile?.createdAt ?? null,
          profileLoaded: true,
        }))
      }
    } catch {}
  }

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken()
      const onboarded = getData('onboarding')

      setTimeout(() => {
        if (!onboarded) {
          navigation.reset({ index: 0, routes: [{ name: SCREEN.onboarding }] })
        } else if (token) {
          store.dispatch(setToken(token))
          fetchProfile(token)
        } else {
          navigation.reset({ index: 0, routes: [{ name: SCREEN.login }] })
        }
      }, 2000)
    }
    checkAuth()
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Safarly</Text>
      <Text style={styles.tagline}>{t('splash.tagline')}</Text>
    </View>
  )
}

const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      fontSize: scale(40),
      fontWeight: '800',
      color: theme.white,
      letterSpacing: 2,
    },
    tagline: {
      fontSize: scale(14),
      color: theme.white,
      marginTop: scale(8),
      opacity: 0.85,
    },
  })
