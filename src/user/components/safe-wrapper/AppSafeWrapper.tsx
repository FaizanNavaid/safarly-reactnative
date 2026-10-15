import React from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../services/style/theme/useTheme'

type Props = {
  children: React.ReactNode
}

const AppSafeWrapper = ({ children }: Props) => {
  const theme = useTheme()

  if (Platform.OS === 'ios') {
    return <View style={styles.container}>{children}</View>
  }

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.container, { backgroundColor: theme.mainBg }]}
    >
      {children}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default AppSafeWrapper
