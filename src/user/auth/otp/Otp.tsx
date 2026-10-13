import { useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useTheme } from '../../services/style/theme/useTheme'
import { ThemeColors } from '../../services/style/color/color'
import { scale } from '../../services/helper/helper'
import { ApiService } from '../../services/api/ApiService'
import { END_POINT } from '../../services/api/endPoint'
import { getApiErrorMessage } from '../../services/api/ApiError'
import { SCREEN } from '../../services/screen-names/ScreenName'
import { OtpParams } from '../../services/interface/interface'
import AppButton from '../../components/buttons/app-button'
import { showError, showSuccess } from '../../components/toast/AppToast'

const OTP_LENGTH = 6
const RESEND_TIMER = 60

export default function Otp() {
  const route = useRoute<any>()
  const { otpData } = route.params as { otpData: OtpParams }

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [isLoading, setIsLoading] = useState(false)
  const [timer, setTimer] = useState(RESEND_TIMER)
  const inputs = useRef<(any)[]>([])

  const { t } = useTranslation()
  const theme = useTheme()
  const styles = getStyles(theme)
  const navigation = useNavigation<any>()

  useEffect(() => {
    if (timer <= 0) return
    const id = setInterval(() => setTimer(prev => prev - 1), 1000)
    return () => clearInterval(id)
  }, [timer])

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp]
    newOtp[index] = text
    setOtp(newOtp)
    if (text && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus()
    }
  }

  const handleBackspace = (index: number) => {
    if (!otp[index] && index > 0) {
      const newOtp = [...otp]
      newOtp[index - 1] = ''
      setOtp(newOtp)
      inputs.current[index - 1]?.focus()
    }
  }

  const otpCode = otp.join('')

  const verifyOtp = async () => {
    if (otpCode.length < OTP_LENGTH) {
      showError(t('common.otpRequired'))
      return
    }
    try {
      setIsLoading(true)
      const payload = { email: otpData.email, otp: otpCode, otpType: otpData.flowType }
      const response = await ApiService.postFromAPI(END_POINT.auth.verifyOtp, payload, '')

      if (response?.success) {
        showSuccess(t('common.success'))

        if (otpData.flowType === 'forgotPassword') {
          navigation.replace(SCREEN.resetPassword, { email: otpData.email, otp: otpCode })
          return
        }

        navigation.replace(SCREEN.login)
      }
    } catch (err: any) {
      showError(getApiErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const resendOtp = async () => {
    try {
      await ApiService.postFromAPI(END_POINT.auth.reSendOtp, { email: otpData.email, otpType: otpData.flowType }, '')
      setTimer(RESEND_TIMER)
      showSuccess(t('otp.resend'))
    } catch (err: any) {
      showError(getApiErrorMessage(err))
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.heading}>{t('otp.title')}</Text>
        <Text style={styles.subtitle}>
          {t('otp.subtitle')} {otpData.email}
        </Text>

        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref: any) => { inputs.current[i] = ref }}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
              value={digit}
              onChangeText={text => handleChange(text, i)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace') handleBackspace(i)
              }}
              keyboardType="number-pad"
              maxLength={1}
              textContentType="oneTimeCode"
            />
          ))}
        </View>

        <AppButton
          title={t('otp.verify')}
          onPress={verifyOtp}
          loading={isLoading}
          disabled={isLoading}
          containerStyle={styles.btn}
        />

        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>{t('otp.didNotReceive')} </Text>
          {timer > 0 ? (
            <Text style={styles.timerText}>
              {t('otp.resendIn')} {timer}s
            </Text>
          ) : (
            <TouchableOpacity onPress={resendOtp}>
              <Text style={styles.resendLink}>{t('otp.resend')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
      marginBottom: scale(40),
    },
    otpRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: scale(12),
      marginBottom: scale(32),
    },
    otpBox: {
      width: scale(46),
      height: scale(46),
      borderRadius: scale(12),
      borderWidth: 1.5,
      borderColor: theme.border,
      backgroundColor: theme.inputBg,
      textAlign: 'center',
      fontSize: scale(22),
      fontWeight: '700',
      color: theme.text,
    },
    otpBoxFilled: {
      borderColor: theme.primary,
    },
    btn: {
      marginTop: scale(4),
    },
    resendRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: scale(24),
    },
    resendLabel: {
      fontSize: scale(14),
      color: theme.subText,
    },
    timerText: {
      fontSize: scale(14),
      color: theme.subText,
      fontWeight: '600',
    },
    resendLink: {
      fontSize: scale(14),
      color: theme.primary,
      fontWeight: '600',
    },
  })
