import { Platform, Alert, Dimensions } from 'react-native'
import { createMMKV } from 'react-native-mmkv'
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
  Permission,
} from 'react-native-permissions'
import DeviceInfo from 'react-native-device-info'


export const storage = createMMKV()

const { width } = Dimensions.get('window')
export const scale = (size: number): number => (width / 375) * size

export const storeData = (key: string, value: string): void => {
  storage.set(key, value)
}

export const getData = (key: string): string | undefined => {
  return storage.getString(key)
}

export const removeData = (key: string): void => {
  storage.remove(key)
}

export const clearApp = (): void => {
  storage.clearAll()
}

export const storeBoolean = (key: string, value: boolean): void => {
  storage.set(key, value)
}

export const getBoolean = (key: string): boolean | undefined => {
  return storage.getBoolean(key)
}

export const storeNumber = (key: string, value: number): void => {
  storage.set(key, value)
}

export const getNumber = (key: string): number | undefined => {
  return storage.getNumber(key)
}

export const hideEmail = (email: string): string => {
  const [user, domain] = email.split('@')
  if (!user || !domain) return email
  const visible = user.slice(0, 2)
  return `${visible}${'*'.repeat(Math.max(user.length - 2, 4))}@${domain}`
}

export const hidePhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.slice(0, 3) + '****' + cleaned.slice(-3)
}

const CAMERA_PERMISSION = Platform.select<Permission>({
  ios: PERMISSIONS.IOS.CAMERA,
  android: PERMISSIONS.ANDROID.CAMERA,
}) as Permission

const GALLERY_PERMISSION = Platform.select<Permission>({
  ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
  android:
    parseInt(Platform.Version as string, 10) >= 33
      ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
      : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
}) as Permission

const LOCATION_PERMISSION = Platform.select<Permission>({
  ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
  android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
}) as Permission

type PermissionConfig = {
  title: string
  message: string
  settingsButtonText?: string
  cancelButtonText?: string
}

const requestPermission = async (
  permission: Permission,
  config: PermissionConfig,
): Promise<boolean> => {
  try {
    const status = await check(permission)

    if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
      return true
    }

    if (status === RESULTS.UNAVAILABLE) {
      Alert.alert(config.title, 'This feature is not available on your device.')
      return false
    }

    if (status === RESULTS.DENIED) {
      const requestResult = await request(permission)
      if (requestResult === RESULTS.GRANTED || requestResult === RESULTS.LIMITED) {
        return true
      }
      if (requestResult === RESULTS.BLOCKED) {
        return new Promise(resolve => {
          Alert.alert(config.title, config.message, [
            { text: config.cancelButtonText || 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: config.settingsButtonText || 'Open Settings', onPress: () => { openSettings().catch(() => {}); resolve(false) } },
          ])
        })
      }
      return false
    }

    if (status === RESULTS.BLOCKED) {
      return new Promise(resolve => {
        Alert.alert(config.title, config.message, [
          { text: config.cancelButtonText || 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          { text: config.settingsButtonText || 'Open Settings', onPress: () => { openSettings().catch(() => {}); resolve(false) } },
        ])
      })
    }

    return false
  } catch {
    return false
  }
}

export const requestCameraPermission = (config?: Partial<PermissionConfig>): Promise<boolean> => {
  return requestPermission(CAMERA_PERMISSION, {
    title: config?.title || 'Camera Permission Required',
    message: config?.message || 'Camera access is needed to take photos. Please enable it from your device settings.',
    settingsButtonText: config?.settingsButtonText,
    cancelButtonText: config?.cancelButtonText,
  })
}

export const requestGalleryPermission = (config?: Partial<PermissionConfig>): Promise<boolean> => {
  return requestPermission(GALLERY_PERMISSION, {
    title: config?.title || 'Gallery Permission Required',
    message: config?.message || 'Photo library access is needed to select photos. Please enable it from your device settings.',
    settingsButtonText: config?.settingsButtonText,
    cancelButtonText: config?.cancelButtonText,
  })
}

export const requestLocationPermission = (config?: Partial<PermissionConfig>): Promise<boolean> => {
  return requestPermission(LOCATION_PERMISSION, {
    title: config?.title || 'Location Permission Required',
    message: config?.message || 'Location access is needed for this feature. Please enable it from your device settings.',
    settingsButtonText: config?.settingsButtonText,
    cancelButtonText: config?.cancelButtonText,
  })
}

export const getDeviceInfo = async () => {
  try {
    const [uniqueId, manufacturer, totalMemory, batteryLevel, isEmulator] =
      await Promise.all([
        DeviceInfo.getUniqueId().catch(() => 'unknown'),
        DeviceInfo.getManufacturer().catch(() => 'unknown'),
        DeviceInfo.getTotalMemory().catch(() => 0),
        DeviceInfo.getBatteryLevel().catch(() => 0),
        DeviceInfo.isEmulator().catch(() => false),
      ])

    let ipAddress = ''
    try {
      ipAddress = await DeviceInfo.getIpAddress()
    } catch {}

    return {
      uniqueId,
      manufacturer,
      totalMemory,
      batteryLevel,
      isEmulator,
      ipAddress,
      deviceId: DeviceInfo.getDeviceId(),
      brand: DeviceInfo.getBrand(),
      model: DeviceInfo.getModel(),
      systemName: DeviceInfo.getSystemName(),
      systemVersion: DeviceInfo.getSystemVersion(),
      appVersion: DeviceInfo.getVersion(),
      buildNumber: DeviceInfo.getBuildNumber(),
      bundleId: DeviceInfo.getBundleId(),
      isTablet: DeviceInfo.isTablet(),
      readableVersion: DeviceInfo.getReadableVersion(),
    }
  } catch {
    return {
      uniqueId: 'unknown',
      manufacturer: 'unknown',
      totalMemory: 0,
      batteryLevel: 0,
      isEmulator: false,
      ipAddress: '',
      deviceId: DeviceInfo.getDeviceId(),
      brand: DeviceInfo.getBrand(),
      model: DeviceInfo.getModel(),
      systemName: DeviceInfo.getSystemName(),
      systemVersion: DeviceInfo.getSystemVersion(),
      appVersion: DeviceInfo.getVersion(),
      buildNumber: DeviceInfo.getBuildNumber(),
      bundleId: DeviceInfo.getBundleId(),
      isTablet: DeviceInfo.isTablet(),
      readableVersion: DeviceInfo.getReadableVersion(),
    }
  }
}

export const formatPrice = (price: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price)
}

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const isValidPhone = (phone: string): boolean => {
  return /^\+?[\d\s\-()]{10,15}$/.test(phone)
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '...'
}

 