import React from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../services/style/theme/useTheme'
import { ThemeColors } from '../../services/style/color/color'
import { scale } from '../../services/helper/helper'
import SkeletonBox from './SkeletonBox'
export default function DetailSkeleton() {
  const theme = useTheme()
  const styles = getStyles(theme)

  return (
    <View style={styles.container}>
      <SkeletonBox width="100%" height={scale(240)} borderRadius={0} />

      <SafeAreaView edges={['top']} style={styles.backBtnWrap}>
        <SkeletonBox width={scale(34)} height={scale(34)} borderRadius={scale(10)} />
      </SafeAreaView>

      <View style={styles.body}>
        <SkeletonBox width="70%" height={scale(22)} borderRadius={scale(6)} />
        <View style={styles.spacerSm} />
        <SkeletonBox width="45%" height={scale(14)} borderRadius={scale(4)} />

        <View style={styles.spacerMd} />

        <View style={styles.tagRow}>
          <SkeletonBox width={scale(60)} height={scale(24)} borderRadius={scale(6)} />
          <SkeletonBox width={scale(120)} height={scale(14)} borderRadius={scale(4)} style={{ marginLeft: scale(10) }} />
        </View>

        <View style={styles.spacerMd} />

        <SkeletonBox width="100%" height={scale(14)} borderRadius={scale(4)} />
        <View style={styles.spacerSm} />
        <SkeletonBox width="100%" height={scale(14)} borderRadius={scale(4)} />
        <View style={styles.spacerSm} />
        <SkeletonBox width="80%" height={scale(14)} borderRadius={scale(4)} />

        <View style={styles.spacerLg} />

        <SkeletonBox width="40%" height={scale(16)} borderRadius={scale(4)} />
        <View style={styles.spacerSm} />
        <View style={styles.chipRow}>
          <SkeletonBox width={scale(70)} height={scale(28)} borderRadius={scale(7)} />
          <SkeletonBox width={scale(90)} height={scale(28)} borderRadius={scale(7)} />
          <SkeletonBox width={scale(60)} height={scale(28)} borderRadius={scale(7)} />
        </View>

        <View style={styles.spacerLg} />

        <SkeletonBox width="50%" height={scale(16)} borderRadius={scale(4)} />
        <View style={styles.spacerSm} />
        <SkeletonBox width="100%" height={scale(12)} borderRadius={scale(4)} />
        <View style={styles.spacerXs} />
        <SkeletonBox width="100%" height={scale(12)} borderRadius={scale(4)} />
        <View style={styles.spacerXs} />
        <SkeletonBox width="70%" height={scale(12)} borderRadius={scale(4)} />

        <View style={styles.spacerLg} />

        <SkeletonBox width="45%" height={scale(16)} borderRadius={scale(4)} />
        <View style={styles.spacerSm} />
        <View style={styles.cardRow}>
          <SkeletonBox width={scale(180)} height={scale(140)} borderRadius={scale(12)} />
          <SkeletonBox width={scale(180)} height={scale(140)} borderRadius={scale(12)} />
        </View>
      </View>
    </View>
  )
}

const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.mainBg,
    },
    backBtnWrap: {
      position: 'absolute',
      top: 0,
      left: scale(16),
      paddingTop: scale(6),
    },
    body: {
      paddingHorizontal: scale(16),
      paddingTop: scale(16),
    },
    tagRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    chipRow: {
      flexDirection: 'row',
      gap: scale(8),
    },
    cardRow: {
      flexDirection: 'row',
      gap: scale(12),
    },
    spacerXs: { height: scale(6) },
    spacerSm: { height: scale(10) },
    spacerMd: { height: scale(16) },
    spacerLg: { height: scale(24) },
  })
