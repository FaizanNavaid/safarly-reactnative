import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { Provider } from 'react-redux'
import Toast from 'react-native-toast-message'
import { store } from './src/user/config/redux/store/Store'
import AppNavigation from './src/user/config/navigation/stack/AppNavigation'
import AppSafeWrapper from './src/user/components/safe-wrapper/AppSafeWrapper'
import './src/user/config/localization/i18n'

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <KeyboardProvider>
          <SafeAreaProvider>
            <AppSafeWrapper>
              <AppNavigation />
              <Toast />
            </AppSafeWrapper>
          </SafeAreaProvider>
        </KeyboardProvider>
      </Provider>
    </GestureHandlerRootView>
  )
}

export default App
