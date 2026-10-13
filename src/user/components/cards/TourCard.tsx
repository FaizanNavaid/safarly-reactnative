import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { TourPackage } from '../../services/interface/interface'
import { ThemeColors } from '../../services/style/color/color'
import { useTheme } from '../../services/style/theme/useTheme'
import { scale } from '../../services/helper/helper'
import AppImage from '../app-image'
import { StarIcon } from '../../assets/icons'

type Props = {
  item: TourPackage
  onPress: () => void
}

const TourCard = ({ item, onPress }: Props) => {
  const theme = useTheme()
  const styles = getStyles(theme)
  const hasDiscount = item.discountPrice && item.discountPrice < item.price

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageWrap}>
        <AppImage source={{ uri: item.coverImage }} style={styles.image} />
        {hasDiscount && (
          <View style={[styles.discountBadge, { backgroundColor: theme.error }]}>
            <Text style={styles.discountText}>
              -{Math.round(((item.price - item.discountPrice!) / item.price) * 100)}%
            </Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {item.destination?.name} · {item.duration.days}D/{item.duration.nights}N
        </Text>
        <View style={styles.bottomRow}>
          <View style={styles.priceWrap}>
            {hasDiscount && (
              <Text style={styles.oldPrice}>{item.currency} {item.price.toLocaleString()}</Text>
            )}
            <Text style={styles.price}>
              {item.currency} {(hasDiscount ? item.discountPrice! : item.price).toLocaleString()}
            </Text>
          </View>
          <View style={styles.ratingPill}>
            <StarIcon width={scale(9)} height={scale(9)} color={theme.copper} />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    container: {
      width: scale(230),
      flexDirection: 'row',
      backgroundColor: theme.cardBg,
      borderRadius: scale(12),
      marginRight: scale(12),
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
      overflow: 'hidden',
    },
    imageWrap: {
      width: scale(85),
      height: scale(95),
    },
    image: {
      width: '100%',
      height: '100%',
    },
    discountBadge: {
      position: 'absolute',
      top: scale(5),
      left: scale(5),
      paddingHorizontal: scale(5),
      paddingVertical: scale(2),
      borderRadius: scale(4),
    },
    discountText: {
      fontSize: scale(8),
      fontWeight: '700',
      color: '#FFFFFF',
    },
    info: {
      flex: 1,
      padding: scale(8),
      justifyContent: 'space-between',
    },
    title: {
      fontSize: scale(12),
      fontWeight: '600',
      color: theme.text,
    },
    meta: {
      fontSize: scale(9),
      color: theme.subText,
      marginTop: scale(2),
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginTop: scale(4),
    },
    priceWrap: {},
    oldPrice: {
      fontSize: scale(9),
      color: theme.placeholder,
      textDecorationLine: 'line-through',
    },
    price: {
      fontSize: scale(11),
      fontWeight: '700',
      color: theme.primary,
    },
    ratingPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.inputBg,
      paddingHorizontal: scale(5),
      paddingVertical: scale(2),
      borderRadius: scale(5),
    },
    rating: {
      fontSize: scale(9),
      fontWeight: '600',
      color: theme.text,
      marginLeft: scale(2),
    },
  })

export default React.memo(TourCard)
