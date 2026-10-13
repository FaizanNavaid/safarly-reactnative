import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Category } from '../../services/interface/interface'
import { ThemeColors } from '../../services/style/color/color'
import { useTheme } from '../../services/style/theme/useTheme'
import { scale } from '../../services/helper/helper'
import AppImage from '../app-image'

type Props = {
  item: Category
  onPress: () => void
}

const CategoryCard = ({ item, onPress }: Props) => {
  const theme = useTheme()
  const styles = getStyles(theme)

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.imageWrap, { backgroundColor: item.color + '15' }]}>
        <AppImage source={{ uri: item.image }} style={styles.image} />
      </View>
      <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  )
}

const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      marginRight: scale(10),
      width: scale(62),
    },
    imageWrap: {
      width: scale(50),
      height: scale(50),
      borderRadius: scale(15),
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: scale(15),
    },
    name: {
      fontSize: scale(10),
      fontWeight: '500',
      color: theme.text,
      marginTop: scale(5),
      textAlign: 'center',
    },
  })

export default React.memo(CategoryCard)
