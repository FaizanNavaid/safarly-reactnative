import { ReactNode } from 'react'
import { StyleSheet } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'

interface AppKeyboardProps {
  children: ReactNode
}

export default function AppKeyboard({ children }: AppKeyboardProps) {
  return (
    <KeyboardAwareScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
      bottomOffset={20}
    >
      {children}
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
})
