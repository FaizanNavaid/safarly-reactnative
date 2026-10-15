import React, { useState } from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet, I18nManager } from 'react-native'
import { createDrawerNavigator, DrawerContentComponentProps } from '@react-navigation/drawer'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { SCREEN } from '../../../services/screen-names/ScreenName'
import { useTheme } from '../../../services/style/theme/useTheme'
import { ThemeColors } from '../../../services/style/color/color'
import { scale, removeData } from '../../../services/helper/helper'
import { HomeIcon, TripIcon, SettingIcon, LogoutIcon, ProfileIcon } from '../../../assets/icons'
import { useAppSelector } from '../../redux/store/Store'
import { store } from '../../redux/store/Store'
import { logoutUser } from '../../redux/slice/userSlice'
import { ApiService } from '../../../services/api/ApiService'
import { END_POINT } from '../../../services/api/endPoint'
import { clearTokens, getRefreshToken } from '../../../services/helper/keychainHelper'
import LogoutModal from '../../../components/logout-modal/LogoutModal'
import TabNavigation from '../tab/TabNavigation'
import Setting from '../../../screens/drawer-screens/setting/Setting'

const Drawer = createDrawerNavigator()

type DrawerItem = {
  name: string
  label: string
  icon: (color: string) => React.ReactNode
}

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const styles = getStyles(theme)
  const insets = useSafeAreaInsets()
  const currentIndex = props.state.index
  const token = useAppSelector(state => state.user.token)
  const { name, email, avatar } = useAppSelector(state => state.user)
  const [logoutVisible, setLogoutVisible] = useState(false)

  const items: DrawerItem[] = [
    {
      name: SCREEN.tabs,
      label: t('drawer.home'),
      icon: (color: string) => <HomeIcon width={scale(22)} height={scale(22)} color={color} />,
    },
    {
      name: SCREEN.setting,
      label: t('drawer.settings'),
      icon: (color: string) => <SettingIcon width={scale(22)} height={scale(22)} color={color} />,
    },
  ]

  const handleLogout = async () => {
    try {
      const refreshToken = await getRefreshToken()
      await ApiService.postFromAPI(END_POINT.auth.logout, { refreshToken }, token)
    } catch {}
    await clearTokens()
    removeData('email')
    store.dispatch(logoutUser())
  }

  return (
    <>
      <View style={[styles.drawerContainer, { paddingTop: insets.top, paddingBottom: insets.bottom > 0 ? insets.bottom - scale(10) : scale(8) }]}>
        <View style={styles.header}>
          <Text style={styles.appName}>Safarly</Text>
        </View>

        <View style={styles.itemsContainer}>
          {items.map((item, index) => {
            const isFocused = currentIndex === index
            const color = isFocused ? theme.primary : theme.icon

            return (
              <TouchableOpacity
                key={item.name}
                style={[styles.drawerItem, isFocused && { backgroundColor: theme.primaryLight }]}
                onPress={() => props.navigation.navigate(item.name)}
                activeOpacity={0.7}
              >
                {item.icon(color)}
                <Text style={[styles.drawerLabel, { color }]}>{item.label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <View style={styles.spacer} />

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => setLogoutVisible(true)}
            activeOpacity={0.7}
          >
            <LogoutIcon width={scale(20)} height={scale(20)} color={theme.error} />
            <Text style={styles.logoutLabel}>{t('common.logout')}</Text>
          </TouchableOpacity>

          <View style={styles.bottomDivider} />

          <TouchableOpacity
            style={styles.userSection}
            onPress={() => {
              props.navigation.closeDrawer()
              props.navigation.navigate(SCREEN.tabs, { screen: SCREEN.profile })
            }}
            activeOpacity={0.7}
          >
            <View style={styles.userAvatar}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.userAvatarImage} />
              ) : (
                <ProfileIcon width={scale(20)} height={scale(20)} color={theme.primary} />
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>{name || t('profile.traveler')}</Text>
              {email ? <Text style={styles.userEmail} numberOfLines={1}>{email}</Text> : null}
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <LogoutModal
        visible={logoutVisible}
        onClose={() => setLogoutVisible(false)}
        onLogout={handleLogout}
      />
    </>
  )
}

export default function DrawerNavigation() {
  const theme = useTheme()

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        overlayColor: 'rgba(0,0,0,0.5)',
        drawerPosition: I18nManager.isRTL ? 'right' : 'left',
        drawerStyle: {
          backgroundColor: theme.mainBg,
          width: scale(280),
        },
      }}
    >
      <Drawer.Screen name={SCREEN.tabs} component={TabNavigation} />
      <Drawer.Screen name={SCREEN.setting} component={Setting} />
    </Drawer.Navigator>
  )
}

const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    drawerContainer: {
      flex: 1,
      backgroundColor: theme.mainBg,
    },
    header: {
      paddingHorizontal: scale(20),
      paddingVertical: scale(24),
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
      marginBottom: scale(10),
    },
    appName: {
      fontSize: scale(24),
      fontWeight: '700',
      color: theme.primary,
    },
    itemsContainer: {
      paddingHorizontal: scale(12),
    },
    drawerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: scale(14),
      paddingVertical: scale(14),
      borderRadius: scale(10),
      marginBottom: scale(4),
    },
    drawerLabel: {
      fontSize: scale(15),
      fontWeight: '500',
      marginLeft: scale(14),
    },
    spacer: {
      flex: 1,
    },
    bottomSection: {
      paddingHorizontal: scale(12),
    },
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: scale(14),
      paddingVertical: scale(12),
      borderRadius: scale(10),
    },
    logoutLabel: {
      fontSize: scale(14),
      fontWeight: '500',
      marginLeft: scale(14),
      color: theme.error,
    },
    bottomDivider: {
      height: 1,
      backgroundColor: theme.divider,
      marginHorizontal: scale(4),
    },
    userSection: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: scale(10),
      paddingVertical: scale(14),
    },
    userAvatar: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      backgroundColor: theme.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderWidth: scale(2),
      borderColor: theme.secondaryLight,
    },
    userAvatarImage: {
      width: '100%',
      height: '100%',
    },
    userInfo: {
      flex: 1,
      marginLeft: scale(12),
    },
    userName: {
      fontSize: scale(14),
      fontWeight: '600',
      color: theme.heading,
    },
    userEmail: {
      fontSize: scale(11),
      color: theme.subText,
      marginTop: scale(2),
    },
  })
