import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Hotel } from '../../services/interface/interface'
import { ThemeColors } from '../../services/style/color/color'
import { useTheme } from '../../services/style/theme/useTheme'
import { scale } from '../../services/helper/helper'
import AppImage from '../app-image'
import { StarIcon, LocationIcon } from '../../assets/icons'
import { useTranslation } from 'react-i18next'

type Props = {
  item: Hotel
  onPress: () => void
}

const HotelCard = ({ item, onPress }: Props) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const styles = getStyles(theme)

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageWrap}>
        <AppImage source={{ uri: item.coverImage }} style={styles.image} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <View style={styles.locationRow}>
          <LocationIcon width={scale(9)} height={scale(9)} color={theme.subText} />
          <Text style={styles.location} numberOfLines={1}>{item.destination?.name}</Text>
        </View>
        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.price}>{item.currency} {item.pricePerNight.toLocaleString()}</Text>
            <Text style={styles.perNight}>{t('home.perNight')}</Text>
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
      width: scale(80),
      height: scale(90),
    },
    image: {
      width: '100%',
      height: '100%',
    },
    info: {
      flex: 1,
      padding: scale(8),
      justifyContent: 'space-between',
    },
    name: {
      fontSize: scale(12),
      fontWeight: '600',
      color: theme.text,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: scale(2),
    },
    location: {
      fontSize: scale(9),
      color: theme.subText,
      marginLeft: scale(3),
      flex: 1,
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginTop: scale(4),
    },
    price: {
      fontSize: scale(11),
      fontWeight: '700',
      color: theme.primary,
    },
    perNight: {
      fontSize: scale(8),
      color: theme.placeholder,
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

export default React.memo(HotelCard)
