import { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useNavigation, useRoute } from '@react-navigation/native'
import { ErrorModel } from '../../services/interface/interface'
import { useTheme } from '../../services/style/theme/useTheme'
import { ThemeColors } from '../../services/style/color/color'
import { scale } from '../../services/helper/helper'
import { validate, resetPasswordSchema } from '../../services/helper/validation'
import { ApiService } from '../../services/api/ApiService'
import { END_POINT } from '../../services/api/endPoint'
import { getApiErrorMessage } from '../../services/api/ApiError'
import { SCREEN } from '../../services/screen-names/ScreenName'
import AppKeyboard from '../../services/app-keyboard-controller/AppKeyBoardController'
import InputField from '../../components/input-field'
import AppButton from '../../components/buttons/app-button'
import { showError, showSuccess } from '../../components/toast/AppToast'

export default function ResetPassword() {
  const route = useRoute<any>()
  const { email, otp } = route.params as { email: string; otp: string }

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ErrorModel>({})

  const { t } = useTranslation()
  const theme = useTheme()
  const styles = getStyles(theme)
  const navigation = useNavigation<any>()

  const resetPass = async () => {
    const result = validate(resetPasswordSchema(), { password, confirmPassword })
    if (!result.success) {
      setError(result.errors)
      return
    }
    try {
      setIsLoading(true)
      const payload = { email, otp, password, confirmPassword }
      const response = await ApiService.postFromAPI(END_POINT.auth.resetPassword, payload, '')
      if (response?.success) {
        showSuccess(t('common.success'))
        navigation.reset({ index: 0, routes: [{ name: SCREEN.login }] })
      }
    } catch (err: any) {
      showError(getApiErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppKeyboard>
        <View style={styles.container}>
          <Text style={styles.heading}>{t('resetPassword.title')}</Text>
          <Text style={styles.subtitle}>{t('resetPassword.subtitle')}</Text>

          <InputField
            value={password}
            label={t('resetPassword.newPassword')}
            placeholder={t('resetPassword.newPassword')}
            onChangeText={v => {
              setPassword(v)
              if (error.password) {
                const copy = { ...error }
                delete copy.password
                setError(copy)
              }
            }}
            error={error.password}
            secureTextEntry
          />

          <InputField
            value={confirmPassword}
            label={t('resetPassword.confirmPassword')}
            placeholder={t('resetPassword.confirmPassword')}
            onChangeText={v => {
              setConfirmPassword(v)
              if (error.confirmPassword) {
                const copy = { ...error }
                delete copy.confirmPassword
                setError(copy)
              }
            }}
            error={error.confirmPassword}
            secureTextEntry
          />

          <AppButton
            title={t('resetPassword.reset')}
            onPress={resetPass}
            loading={isLoading}
            disabled={isLoading}
            containerStyle={styles.btn}
          />

          <TouchableOpacity
            style={styles.backRow}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: SCREEN.login }] })}>
            <Text style={styles.backText}>{t('resetPassword.backToLogin')}</Text>
          </TouchableOpacity>
        </View>
      </AppKeyboard>
    </SafeAreaView>
  )
}

const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.mainBg,
    },
    container: {
      flex: 1,
      paddingHorizontal: scale(20),
      paddingTop: scale(60),
    },
    heading: {
      fontSize: scale(28),
      fontWeight: '700',
      color: theme.text,
    },
    subtitle: {
      fontSize: scale(14),
      color: theme.subText,
      marginTop: scale(8),
      marginBottom: scale(30),
      lineHeight: scale(20),
    },
    btn: {
      marginTop: scale(12),
    },
    backRow: {
      alignItems: 'center',
      marginTop: scale(24),
    },
    backText: {
      fontSize: scale(14),
      color: theme.primary,
      fontWeight: '600',
    },
  })
