import React from 'react'
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native'
import { useTheme } from '../../services/style/theme/useTheme'
import { ThemeColors } from '../../services/style/color/color'
import { scale } from '../../services/helper/helper'
import SkeletonBox from './SkeletonBox'

const { width: SCREEN_W } = Dimensions.get('window')
const FEATURED_W = SCREEN_W - scale(48)

export default function HomeSkeleton() {
  const theme = useTheme()
  const styles = getStyles(theme)

  const sectionHeader = (
    <View style={styles.sectionHeader}>
      <SkeletonBox width={scale(100)} height={scale(15)} borderRadius={scale(4)} />
      <SkeletonBox width={scale(45)} height={scale(11)} borderRadius={scale(4)} />
    </View>
  )

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <SkeletonBox width={scale(38)} height={scale(38)} borderRadius={scale(19)} />
        <View style={styles.headerText}>
          <SkeletonBox width={scale(140)} height={scale(18)} borderRadius={scale(4)} />
          <View style={styles.spacerXs} />
          <SkeletonBox width={scale(100)} height={scale(11)} borderRadius={scale(4)} />
        </View>
        <SkeletonBox width={scale(36)} height={scale(36)} borderRadius={scale(12)} />
      </View>

      <View style={styles.searchWrap}>
        <SkeletonBox width="100%" height={scale(42)} borderRadius={scale(10)} />
      </View>

      <View style={styles.section}>
        {sectionHeader}
        <View style={styles.row}>
          {[1, 2, 3, 4].map(i => (
            <View key={i} style={styles.categoryItem}>
              <SkeletonBox width={scale(52)} height={scale(52)} borderRadius={scale(14)} />
              <View style={styles.spacerXs} />
              <SkeletonBox width={scale(42)} height={scale(10)} borderRadius={scale(4)} />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        {sectionHeader}
        <View style={styles.row}>
          <SkeletonBox width={FEATURED_W} height={scale(165)} borderRadius={scale(14)} />
        </View>
      </View>

      <View style={styles.section}>
        {sectionHeader}
        <View style={styles.row}>
          {[1, 2, 3].map(i => (
            <View key={i} style={styles.cardItem}>
              <SkeletonBox width={scale(140)} height={scale(110)} borderRadius={scale(12)} />
              <View style={styles.spacerSm} />
              <SkeletonBox width={scale(100)} height={scale(12)} borderRadius={scale(4)} />
              <View style={styles.spacerXs} />
              <SkeletonBox width={scale(70)} height={scale(10)} borderRadius={scale(4)} />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        {sectionHeader}
        <View style={styles.row}>
          {[1, 2, 3].map(i => (
            <View key={i} style={styles.cardItem}>
              <SkeletonBox width={scale(140)} height={scale(110)} borderRadius={scale(12)} />
              <View style={styles.spacerSm} />
              <SkeletonBox width={scale(100)} height={scale(12)} borderRadius={scale(4)} />
              <View style={styles.spacerXs} />
              <SkeletonBox width={scale(70)} height={scale(10)} borderRadius={scale(4)} />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.mainBg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: scale(16),
      paddingTop: scale(6),
      paddingBottom: scale(8),
    },
    headerText: {
      flex: 1,
      marginLeft: scale(10),
    },
    searchWrap: {
      paddingHorizontal: scale(12),
    },
    section: {
      marginTop: scale(18),
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: scale(16),
      marginBottom: scale(10),
    },
    row: {
      flexDirection: 'row',
      paddingHorizontal: scale(16),
      gap: scale(12),
    },
    categoryItem: {
      alignItems: 'center',
    },
    cardItem: {
      width: scale(140),
    },
    spacerXs: { height: scale(6) },
    spacerSm: { height: scale(8) },
  })
