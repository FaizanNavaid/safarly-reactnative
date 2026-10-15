import React from 'react'
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs'
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { SCREEN } from '../../../services/screen-names/ScreenName'
import { useTheme } from '../../../services/style/theme/useTheme'
import { ThemeColors } from '../../../services/style/color/color'
import { scale } from '../../../services/helper/helper'
import { HomeIcon, BookingIcon, ProfileIcon } from '../../../assets/icons'
import Home from '../../../screens/tab-screens/home/Home'
import Bookings from '../../../screens/tab-screens/bookings/Bookings'
import Profile from '../../../screens/tab-screens/profile/Profile'

const Tab = createBottomTabNavigator()

type TabItem = {
  name: string
  label: string
  icon: (color: string) => React.ReactNode
}

const AnimatedTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const styles = getStyles(theme)

  const tabs: TabItem[] = [
    {
      name: SCREEN.home,
      label: t('tab.home'),
      icon: (color: string) => <HomeIcon width={scale(22)} height={scale(22)} color={color} />,
    },
    {
      name: SCREEN.bookings,
      label: t('tab.bookings'),
      icon: (color: string) => <BookingIcon width={scale(22)} height={scale(22)} color={color} />,
    },
    {
      name: SCREEN.profile,
      label: t('tab.profile'),
      icon: (color: string) => <ProfileIcon width={scale(22)} height={scale(22)} color={color} />,
    },
  ]

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: Platform.OS === 'ios' && insets.bottom > 0 ? insets.bottom - scale(10) : scale(8) }]}>
      {tabs.map((tab, index) => {
        const isFocused = state.index === index

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: state.routes[index].key,
            canPreventDefault: true,
          })
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(state.routes[index].name)
          }
        }

        return (
          <TabButton
            key={tab.name}
            tab={tab}
            isFocused={isFocused}
            onPress={onPress}
            theme={theme}
          />
        )
      })}
    </View>
  )
}

type TabButtonProps = {
  tab: TabItem
  isFocused: boolean
  onPress: () => void
  theme: ThemeColors
}

const TabButton = ({ tab, isFocused, onPress, theme }: TabButtonProps) => {
  const styles = getStyles(theme)

  const animatedScale = useSharedValue(1)

  React.useEffect(() => {
    animatedScale.value = withSpring(isFocused ? 1.1 : 1, { damping: 15, stiffness: 120 })
  }, [isFocused])

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animatedScale.value }],
  }))

  const color = isFocused ? theme.tabActive : theme.tabInactive

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.tabButton}
    >
      <Animated.View style={iconAnimStyle}>
        {tab.icon(color)}
      </Animated.View>
      <Text style={[styles.tabLabel, { color }]}>
        {tab.label}
      </Text>
      {isFocused && <View style={[styles.indicator, { backgroundColor: theme.tabActive }]} />}
    </TouchableOpacity>
  )
}

export default function TabNavigation() {
  return (
    <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name={SCREEN.home} component={Home} />
      <Tab.Screen name={SCREEN.bookings} component={Bookings} />
      <Tab.Screen name={SCREEN.profile} component={Profile} />
    </Tab.Navigator>
  )
}

const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    tabBarContainer: {
      flexDirection: 'row',
      backgroundColor: theme.tabBar,
      paddingTop: scale(8),
      borderTopWidth: 1,
      borderTopColor: theme.divider,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 8,
    },
    tabButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      // paddingVertical: scale(6),
    },
    tabLabel: {
      fontSize: scale(11),
      fontWeight: '500',
      marginTop: scale(4),
    },
    indicator: {
      width: scale(20),
      height: scale(3),
      borderRadius: scale(2),
      marginTop: scale(4),
    },
  })
