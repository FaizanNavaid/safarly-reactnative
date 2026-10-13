import { StyleSheet, TouchableOpacity } from 'react-native'
import { IconButtonProps } from '../../../services/interface/interface'
import { useTheme } from '../../../services/style/theme/useTheme'
import { ThemeColors } from '../../../services/style/color/color'
import { scale } from '../../../services/helper/helper'

export default function IconButton(props: IconButtonProps) {
  const {
    icon,
    onPress,
    size = 40,
    bgColor,
    disabled = false,
    containerStyle,
  } = props

  const theme = useTheme()
  const styles = getStyles(theme, size)

  return (
    <TouchableOpacity
      style={[
        styles.button,
        bgColor ? { backgroundColor: bgColor } : null,
        disabled ? styles.disabled : null,
        containerStyle,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}>
      {icon}
    </TouchableOpacity>
  )
}

const getStyles = (theme: ThemeColors, size: number) =>
  StyleSheet.create({
    button: {
      width: scale(size),
      height: scale(size),
      borderRadius: scale(size / 2),
      backgroundColor: theme.secondBg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    disabled: {
      opacity: 0.5,
    },
  })
