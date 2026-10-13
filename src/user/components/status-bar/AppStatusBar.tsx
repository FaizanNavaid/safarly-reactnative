import React from 'react'
import { StatusBar, View, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAppSelector } from '../../config/redux/store/Store'
import { useTheme } from '../../services/style/theme/useTheme'

type Props = {
  barStyle?: 'light-content' | 'dark-content'
  bgColor?: string
}

const AppStatusBar = ({ barStyle, bgColor }: Props) => {
  const mode = useAppSelector(state => state.theme.mode)
  const theme = useTheme()
  const insets = useSafeAreaInsets()

  const appliedBarStyle = barStyle || (mode === 'dark' ? 'light-content' : 'dark-content')

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={appliedBarStyle}
      />
      <View
        style={[
          styles.statusBarFill,
          {
            height: insets.top,
            backgroundColor: bgColor || theme.headerBg,
          },
        ]}
      />
    </>
  )
}

const styles = StyleSheet.create({
  statusBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
})

export default AppStatusBar
