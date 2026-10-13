import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { InputFieldProps } from '../../services/interface/interface'
import { useTheme } from '../../services/style/theme/useTheme'
import { ThemeColors } from '../../services/style/color/color'
import { scale } from '../../services/helper/helper'

export default function InputField(props: InputFieldProps) {
  const {
    label,
    placeholder,
    value,
    onChangeText,
    leftIcon,
    rightIcon,
    onLeftIconPress,
    onRightIconPress,
    secureTextEntry,
    error,
    editable = true,
    containerStyle,
    inputStyle,
    ...rest
  } = props

  const theme = useTheme()
  const styles = getStyles(theme)

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.container, error ? styles.errorBorder : null]}>
        {leftIcon && (
          <TouchableOpacity
            onPress={onLeftIconPress}
            disabled={!onLeftIconPress}
            style={styles.iconBox}>
            {leftIcon}
          </TouchableOpacity>
        )}
        <TextInput
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={theme.placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          editable={editable}
          {...rest}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.iconBox}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: scale(12),
    },
    label: {
      fontSize: scale(14),
      color: theme.text,
      marginBottom: scale(6),
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.inputBg,
      borderRadius: scale(10),
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: scale(12),
      height: scale(40),
    },
    errorBorder: {
      borderColor: theme.error,
    },
    iconBox: {
      justifyContent: 'center',
      alignItems: 'center',
      width: scale(24),
      height: scale(24),
    },
    input: {
      flex: 1,
      fontSize: scale(14),
      color: theme.text,
      paddingHorizontal: scale(8),
      paddingVertical: 0,
    },
    errorText: {
      fontSize: scale(12),
      color: theme.error,
      marginTop: scale(4),
    },
  })
