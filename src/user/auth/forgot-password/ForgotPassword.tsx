import { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import { ErrorModel } from '../../services/interface/interface'
import { useTheme } from '../../services/style/theme/useTheme'
import { ThemeColors } from '../../services/style/color/color'
import { scale } from '../../services/helper/helper'
import { validate, forgotPasswordSchema } from '../../services/helper/validation'
import { ApiService } from '../../services/api/ApiService'
import { END_POINT } from '../../services/api/endPoint'
import { getApiErrorMessage } from '../../services/api/ApiError'
import { SCREEN } from '../../services/screen-names/ScreenName'
import AppKeyboard from '../../services/app-keyboard-controller/AppKeyBoardController'
import InputField from '../../components/input-field'
import AppButton from '../../components/buttons/app-button'
import { showError } from '../../components/toast/AppToast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ErrorModel>({})

  const { t } = useTranslation()
  const theme = useTheme()
  const styles = getStyles(theme)
  const navigation = useNavigation<any>()

  const sendCode = async () => {
    const result = validate(forgotPasswordSchema(), { email })
    if (!result.success) {
      setError(result.errors)
      return
    }
    try {
      setIsLoading(true)
      const response = await ApiService.postFromAPI(
        END_POINT.auth.forgotPassword,
        { email },
        '',
      )
      if (response?.success) {
        navigation.navigate(SCREEN.otp, {
          otpData: { email, flowType: 'forgotPassword' },
        })
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
          <Text style={styles.heading}>{t('forgotPassword.title')}</Text>
          <Text style={styles.subtitle}>{t('forgotPassword.subtitle')}</Text>

          <InputField
            value={email}
            label={t('login.email')}
            placeholder={t('login.email')}
            onChangeText={v => {
              setEmail(v)
              if (error.email) setError({})
            }}
            error={error.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <AppButton
            title={t('forgotPassword.send')}
            onPress={sendCode}
            loading={isLoading}
            disabled={isLoading}
            containerStyle={styles.btn}
          />

          <TouchableOpacity
            style={styles.backRow}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>{t('forgotPassword.backToLogin')}</Text>
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
