import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../../services/style/theme/useTheme'
import { ThemeColors } from '../../services/style/color/color'
import { scale } from '../../services/helper/helper'
import { BackIcon } from '../../assets/icons'

interface CustomHeaderProps {
  title?: string | React.ReactNode
  titleStyle?: TextStyle
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onLeftIconPress?: () => void
  onRightIconPress?: () => void
  containerStyle?: ViewStyle
  showBack?: boolean
  borderless?: boolean
}

export default function CustomHeader(props: CustomHeaderProps) {
  const theme = useTheme()
  const styles = getStyles(theme)
  const navigation = useNavigation()

  const {
    title = '',
    titleStyle,
    leftIcon,
    rightIcon,
    onLeftIconPress,
    onRightIconPress,
    containerStyle,
    showBack = true,
    borderless = false,
  } = props

  const handleLeftPress = onLeftIconPress || (showBack ? () => navigation.goBack() : undefined)

  const resolvedLeftIcon = leftIcon ?? (showBack
    ? <BackIcon width={scale(20)} height={scale(20)} color={theme.headerText} />
    : null)

  return (
    <View style={[styles.container, borderless && styles.borderless, containerStyle]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleLeftPress}
        disabled={!handleLeftPress}
        style={styles.iconContainer}
      >
        {resolvedLeftIcon || <View style={styles.iconPlaceholder} />}
      </TouchableOpacity>

      {typeof title === 'string' ? (
        <Text numberOfLines={1} style={[styles.title, titleStyle]}>
          {title}
        </Text>
      ) : (
        <View style={styles.titleContainer}>{title}</View>
      )}

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onRightIconPress}
        disabled={!onRightIconPress}
        style={styles.iconContainer}
      >
        {rightIcon || <View style={styles.iconPlaceholder} />}
      </TouchableOpacity>
    </View>
  )
}

const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    container: {
      width: '100%',
      height: scale(34),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: scale(4),
      backgroundColor: theme.headerBg,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.divider,
    },
    borderless: {
      borderBottomWidth: 0,
      borderBottomColor: 'transparent',
    },
    iconContainer: {
      width: scale(40),
      height: scale(40),
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconPlaceholder: {
      width: scale(40),
    },
    titleContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      flex: 1,
      textAlign: 'center',
      fontWeight: '600',
      fontSize: scale(17),
      color: theme.headerText,
    },
  })
