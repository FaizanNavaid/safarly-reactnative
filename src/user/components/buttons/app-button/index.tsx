import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { AppButtonProps } from '../../../services/interface/interface'
import { useTheme } from '../../../services/style/theme/useTheme'
import { ThemeColors } from '../../../services/style/color/color'
import { scale } from '../../../services/helper/helper'

export default function AppButton(props: AppButtonProps) {
  const {
    title,
    onPress,
    loading = false,
    disabled = false,
    bgColor,
    textColor,
    containerStyle,
    textStyle,
  } = props

  const theme = useTheme()
  const styles = getStyles(theme)

  return (
    <TouchableOpacity
      style={[
        styles.button,
        bgColor ? { backgroundColor: bgColor } : null,
        disabled ? styles.disabled : null,
        containerStyle,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator color={textColor || theme.white} size={scale(20)} />
      ) : (
        <Text style={[styles.text, textColor ? { color: textColor } : null, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    button: {
      backgroundColor: theme.primary,
      height: scale(48),
      borderRadius: scale(10),
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: scale(20),
    },
    disabled: {
      opacity: 0.5,
    },
    text: {
      fontSize: scale(16),
      fontWeight: '600',
      color: theme.white,
    },
  })
