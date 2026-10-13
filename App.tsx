import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider } from 'react-redux'
import Toast from 'react-native-toast-message'
import { store } from './src/user/config/redux/store/Store'
import AppNavigation from './src/user/config/navigation/stack/AppNavigation'
import './src/user/config/localization/i18n'

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <AppNavigation />
          <Toast />
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  )
}

export default App
