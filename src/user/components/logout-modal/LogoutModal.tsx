import React, { useState } from 'react'
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../services/style/theme/useTheme'
import { ThemeColors } from '../../services/style/color/color'
import { scale } from '../../services/helper/helper'
import { LogoutIcon } from '../../assets/icons'

type LogoutModalProps = {
  visible: boolean
  onClose: () => void
  onLogout: () => Promise<void>
}

export default function LogoutModal({ visible, onClose, onLogout }: LogoutModalProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = getStyles(theme)
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await onLogout()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.container} activeOpacity={1}>
          <View style={styles.iconWrap}>
            <LogoutIcon width={scale(28)} height={scale(28)} color={theme.error} />
          </View>
          <Text style={styles.title}>{t('logout.title')}</Text>
          <Text style={styles.message}>{t('logout.message')}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7} disabled={loading}>
              <Text style={styles.cancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color={theme.white} />
              ) : (
                <Text style={styles.logoutText}>{t('common.logout')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(30),
  },
  container: {
    width: '100%',
    backgroundColor: theme.cardBg,
    borderRadius: scale(20),
    paddingVertical: scale(28),
    paddingHorizontal: scale(24),
    alignItems: 'center',
  },
  iconWrap: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    backgroundColor: theme.errorLight || 'rgba(239,68,68,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(16),
  },
  title: {
    fontSize: scale(18),
    fontWeight: '700',
    color: theme.heading,
    marginBottom: scale(8),
  },
  message: {
    fontSize: scale(13),
    color: theme.subText,
    textAlign: 'center',
    lineHeight: scale(20),
    marginBottom: scale(24),
  },
  buttonRow: {
    flexDirection: 'row',
    gap: scale(12),
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: scale(13),
    borderRadius: scale(12),
    backgroundColor: theme.inputBg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  cancelText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: theme.text,
  },
  logoutBtn: {
    flex: 1,
    paddingVertical: scale(13),
    borderRadius: scale(12),
    backgroundColor: theme.error,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: theme.white,
  },
})
