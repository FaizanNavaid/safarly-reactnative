import React from 'react'
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAppSelector } from '../../redux/store/Store'
import { useTheme } from '../../../services/style/theme/useTheme'
import { SCREEN } from '../../../services/screen-names/ScreenName'
import Splash from '../../../screens/onboarding/Splash'
import Onboarding from '../../../screens/onboarding/Onboarding'
import Login from '../../../auth/login/Login'
import SignUp from '../../../auth/sign-up/SignUp'
import Otp from '../../../auth/otp/Otp'
import ForgotPassword from '../../../auth/forgot-password/ForgotPassword'
import ResetPassword from '../../../auth/reset-password/ResetPassword'
import DrawerNavigation from '../drawer/DrawerNavigation'
import TripDetail from '../../../screens/stack-screens/trip-detail/TripDetail'
import PrivacyPolicy from '../../../screens/stack-screens/privacy-policy/PrivacyPolicy'
import DestinationDetail from '../../../screens/stack-screens/destination-detail/DestinationDetail'
import TourDetailScreen from '../../../screens/stack-screens/tour-detail/TourDetail'
import HotelDetailScreen from '../../../screens/stack-screens/hotel-detail/HotelDetail'
import BookingStepOne from '../../../screens/stack-screens/booking-step-one/BookingStepOne'
import BookingStepTwo from '../../../screens/stack-screens/booking-step-two/BookingStepTwo'

const Stack = createNativeStackNavigator()

export default function AppNavigation() {
  const theme = useTheme()
  const isLoggedIn = useAppSelector(state => state.user.isLoggedIn)
  const mode = useAppSelector(state => state.theme.mode)

  const navTheme = {
    ...(mode === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(mode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.mainBg,
      card: theme.headerBg,
      text: theme.text,
      border: theme.border,
      primary: theme.primary,
    },
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <>
            <Stack.Screen name={SCREEN.main} component={DrawerNavigation} />
            <Stack.Screen name={SCREEN.tripDetail} component={TripDetail} />
            <Stack.Screen name={SCREEN.privacyPolicy} component={PrivacyPolicy} />
            <Stack.Screen name={SCREEN.destinationDetail} component={DestinationDetail} />
            <Stack.Screen name={SCREEN.tourDetail} component={TourDetailScreen} />
            <Stack.Screen name={SCREEN.hotelDetail} component={HotelDetailScreen} />
            <Stack.Screen name={SCREEN.bookingStepOne} component={BookingStepOne} />
            <Stack.Screen name={SCREEN.bookingStepTwo} component={BookingStepTwo} />
          </>
        ) : (
          <>
            <Stack.Screen name={SCREEN.splash} component={Splash} />
            <Stack.Screen name={SCREEN.onboarding} component={Onboarding} />
            <Stack.Screen name={SCREEN.login} component={Login} />
            <Stack.Screen name={SCREEN.signup} component={SignUp} />
            <Stack.Screen name={SCREEN.otp} component={Otp} />
            <Stack.Screen name={SCREEN.forgotPassword} component={ForgotPassword} />
            <Stack.Screen name={SCREEN.resetPassword} component={ResetPassword} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
