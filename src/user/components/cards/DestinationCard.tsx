import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Destination } from '../../services/interface/interface'
import { ThemeColors } from '../../services/style/color/color'
import { useTheme } from '../../services/style/theme/useTheme'
import { scale } from '../../services/helper/helper'
import AppImage from '../app-image'
import { StarIcon, LocationIcon } from '../../assets/icons'

type Props = {
  item: Destination
  onPress: () => void
}

const DestinationCard = ({ item, onPress }: Props) => {
  const theme = useTheme()
  const styles = getStyles(theme)

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.85}>
      <AppImage source={{ uri: item.coverImage }} style={styles.image} />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <View style={styles.row}>
          <LocationIcon width={scale(10)} height={scale(10)} color="rgba(255,255,255,0.85)" />
          <Text style={styles.location} numberOfLines={1}>{item.city}</Text>
        </View>
      </View>
      <View style={styles.ratingBadge}>
        <StarIcon width={scale(8)} height={scale(8)} color={theme.copper} />
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>
    </TouchableOpacity>
  )
}

const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    container: {
      width: scale(140),
      height: scale(175),
      borderRadius: scale(14),
      overflow: 'hidden',
      marginRight: scale(12),
    },
    image: {
      width: '100%',
      height: '100%',
    },
    overlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0,0,0,0.25)',
    },
    content: {
      position: 'absolute',
      bottom: scale(10),
      left: scale(10),
      right: scale(10),
    },
    name: {
      fontSize: scale(13),
      fontWeight: '700',
      color: '#FFFFFF',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: scale(3),
    },
    location: {
      fontSize: scale(10),
      color: 'rgba(255,255,255,0.85)',
      marginLeft: scale(3),
    },
    ratingBadge: {
      position: 'absolute',
      top: scale(8),
      right: scale(8),
      backgroundColor: 'rgba(0,0,0,0.55)',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: scale(6),
      paddingVertical: scale(3),
      borderRadius: scale(6),
    },
    ratingText: {
      fontSize: scale(9),
      fontWeight: '700',
      color: '#FFFFFF',
      marginLeft: scale(3),
    },
  })

export default React.memo(DestinationCard)
