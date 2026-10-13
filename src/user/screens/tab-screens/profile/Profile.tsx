import React, { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import {
  launchCamera,
  launchImageLibrary,
  Asset,
  ImagePickerResponse,
} from 'react-native-image-picker'

import { useTheme } from '../../../services/style/theme/useTheme'
import { ThemeColors } from '../../../services/style/color/color'
import {
  requestCameraPermission,
  requestGalleryPermission,
  scale,
} from '../../../services/helper/helper'
import { AppDispatch, useAppSelector } from '../../../config/redux/store/Store'
import { useDispatch } from 'react-redux'
import { setUser } from '../../../config/redux/slice/userSlice'
import { ApiService } from '../../../services/api/ApiService'
import { END_POINT } from '../../../services/api/endPoint'
import {
  CameraIcon,
  ProfileIcon,
  EmailIcon,
  SupportIcon,
  CalenderIcon,
  VerifiedBadgeIcon,
} from '../../../assets/icons'
import { showError, showSuccess } from '../../../components/toast/AppToast'
import AppStatusBar from '../../../components/status-bar/AppStatusBar'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

export default function Profile() {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = getStyles(theme)
  const dispatch = useDispatch<AppDispatch>()
  const token = useAppSelector(state => state.user.token)
  const { firstName, lastName, name, email, phone, avatar, isVerified, createdAt } =
    useAppSelector(state => state.user)
  const [uploading, setUploading] = useState(false)

  const resolveImageMime = (asset: Asset): string => {
    const ext = (
      asset.fileName?.split('.').pop() ||
      asset.uri?.split('.').pop() ||
      ''
    ).toLowerCase()
    const extMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      heic: 'image/jpeg',
      heif: 'image/jpeg',
    }
    if (extMap[ext]) return extMap[ext]
    const rawType = asset.type?.toLowerCase() || ''
    if (
      rawType === 'image/jpg' ||
      rawType === 'image/heic' ||
      rawType === 'image/heif'
    )
      return 'image/jpeg'
    if (rawType === 'image/png' || rawType === 'image/webp') return rawType
    if (rawType.startsWith('image/')) return 'image/jpeg'
    return 'image/jpeg'
  }

  const uploadPicture = async (asset: Asset) => {
    if (!asset.uri) return
    if (asset.fileSize && asset.fileSize > MAX_IMAGE_SIZE) {
      showError(t('profile.fileTooLarge'))
      return
    }

    const mimeType = resolveImageMime(asset)
    const extension = mimeType.split('/')[1]
    const formData = new FormData()
    formData.append('picture', {
      uri: asset.uri,
      name: asset.fileName || `profile-picture.${extension}`,
      type: mimeType,
    } as any)

    try {
      setUploading(true)
      const response = await ApiService.uploadFromAPI<{
        profilePicture?: string
      }>(END_POINT.auth.uploadProfilePicture, formData, token)
      if (!response?.success)
        throw new Error(response?.message || t('profile.uploadError'))
      const data: any = response.data
      const picture =
        data?.profilePicture ??
        data?.profile?.profilePicture ??
        data?.user?.profilePicture
      if (picture) dispatch(setUser({ avatar: picture }))
      showSuccess(t('profile.uploadSuccess'))
    } catch (error: any) {
      showError(error?.message || t('profile.uploadError'))
    } finally {
      setUploading(false)
    }
  }

  const handlePickerResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) return
    if (response.errorCode) {
      showError(response.errorMessage || t('profile.pickerError'))
      return
    }
    const asset = response.assets?.[0]
    if (asset) uploadPicture(asset)
  }

  const choosePhoto = () => {
    Alert.alert(t('profile.changePicture'), t('profile.chooseSource'), [
      {
        text: t('profile.takePhoto'),
        onPress: async () => {
          const granted = await requestCameraPermission({
            title: t('profile.cameraPermissionTitle'),
            message: t('profile.cameraPermissionMessage'),
            settingsButtonText: t('profile.openSettings'),
            cancelButtonText: t('common.cancel'),
          })
          if (!granted) return
          const response = await launchCamera({
            mediaType: 'photo',
            cameraType: 'front',
            quality: 0.8,
            maxWidth: 1200,
            maxHeight: 1200,
            assetRepresentationMode: 'compatible',
          })
          handlePickerResponse(response)
        },
      },
      {
        text: t('profile.choosePhoto'),
        onPress: async () => {
          const granted = await requestGalleryPermission({
            title: t('profile.galleryPermissionTitle'),
            message: t('profile.galleryPermissionMessage'),
            settingsButtonText: t('profile.openSettings'),
            cancelButtonText: t('common.cancel'),
          })
          if (!granted) return
          const response = await launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 1,
            quality: 0.8,
            maxWidth: 1200,
            maxHeight: 1200,
            assetRepresentationMode: 'compatible',
          })
          handlePickerResponse(response)
        },
      },
      { text: t('common.cancel'), style: 'cancel' },
    ])
  }

  const formattedCreatedAt = createdAt
    ? new Date(createdAt).toLocaleDateString()
    : t('profile.notAvailable')

  const initials = `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase()

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppStatusBar barStyle="light-content" bgColor={theme.primary} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.heroBg} />

          <View style={styles.avatarContainer}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatarImage} />
                ) : initials ? (
                  <Text style={styles.initialsText}>{initials}</Text>
                ) : (
                  <ProfileIcon
                    width={scale(44)}
                    height={scale(44)}
                    color={theme.primary}
                  />
                )}
                {uploading && (
                  <View style={styles.uploadOverlay}>
                    <ActivityIndicator size="small" color={theme.white} />
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={choosePhoto}
              disabled={uploading}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('profile.changePicture')}
            >
              <CameraIcon
                width={scale(15)}
                height={scale(15)}
                color={theme.buttonText}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{name || t('profile.traveler')}</Text>
          <Text style={styles.userEmail}>{email || t('profile.notAvailable')}</Text>

          <View
            style={[
              styles.verifiedChip,
              { backgroundColor: isVerified ? theme.successLight : theme.warningLight },
            ]}
          >
            {isVerified && (
              <VerifiedBadgeIcon size={scale(13)} color={theme.success} />
            )}
            <Text
              style={[
                styles.verifiedChipText,
                { color: isVerified ? theme.success : theme.warning },
              ]}
            >
              {isVerified ? t('profile.verified') : t('profile.unverified')}
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionLabel}>{t('profile.accountDetails')}</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={[styles.infoIconWrap, { backgroundColor: theme.primaryLight }]}>
                <EmailIcon width={scale(18)} height={scale(18)} color={theme.primary} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>{t('profile.email')}</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {email || t('profile.notAvailable')}
                </Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={[styles.infoIconWrap, { backgroundColor: theme.infoLight }]}>
                <SupportIcon width={scale(18)} height={scale(18)} color={theme.info} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>{t('profile.phone')}</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {phone || t('profile.notAvailable')}
                </Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={[styles.infoIconWrap, { backgroundColor: theme.warningLight }]}>
                <CalenderIcon width={scale(18)} height={scale(18)} color={theme.warning} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>{t('profile.memberSince')}</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {formattedCreatedAt}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.primary,
    },
    scrollView: {
      flex: 1,
      backgroundColor: theme.mainBg,
    },
    content: {
      paddingBottom: scale(32),
    },
    heroSection: {
      alignItems: 'center',
      paddingBottom: scale(24),
      paddingHorizontal: scale(20),
    },
    heroBg: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: scale(120),
      backgroundColor: theme.primary,
      borderBottomLeftRadius: scale(28),
      borderBottomRightRadius: scale(28),
    },
    avatarContainer: {
      marginTop: scale(60),
      position: 'relative',
      marginBottom: scale(16),
    },
    avatarRing: {
      width: scale(120),
      height: scale(120),
      borderRadius: scale(60),
      padding: scale(4),
      backgroundColor: theme.cardBg,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    avatar: {
      flex: 1,
      borderRadius: scale(56),
      backgroundColor: theme.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    initialsText: {
      fontSize: scale(32),
      fontWeight: '700',
      color: theme.primary,
    },
    cameraButton: {
      position: 'absolute',
      right: scale(2),
      bottom: scale(2),
      width: scale(34),
      height: scale(34),
      borderRadius: scale(17),
      backgroundColor: theme.primary,
      borderWidth: scale(3),
      borderColor: theme.cardBg,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    uploadOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: theme.modalBg,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: scale(56),
    },
    userName: {
      fontSize: scale(22),
      fontWeight: '700',
      color: theme.heading,
      textAlign: 'center',
    },
    userEmail: {
      fontSize: scale(13),
      color: theme.subText,
      marginTop: scale(4),
      textAlign: 'center',
    },
    verifiedChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(5),
      paddingHorizontal: scale(12),
      paddingVertical: scale(6),
      borderRadius: scale(20),
      marginTop: scale(12),
    },
    verifiedChipText: {
      fontSize: scale(11),
      fontWeight: '700',
    },
    infoSection: {
      paddingHorizontal: scale(20),
      marginTop: scale(8),
    },
    sectionLabel: {
      fontSize: scale(13),
      fontWeight: '600',
      color: theme.subText,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: scale(12),
    },
    infoCard: {
      backgroundColor: theme.cardBg,
      borderRadius: scale(16),
      padding: scale(4),
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.border,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: scale(14),
      paddingHorizontal: scale(14),
    },
    infoIconWrap: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(12),
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoTextWrap: {
      flex: 1,
      marginLeft: scale(14),
    },
    infoLabel: {
      fontSize: scale(11),
      color: theme.subText,
      marginBottom: scale(3),
    },
    infoValue: {
      fontSize: scale(14),
      fontWeight: '600',
      color: theme.heading,
    },
    infoDivider: {
      height: 1,
      backgroundColor: theme.divider,
      marginHorizontal: scale(14),
    },
  })
