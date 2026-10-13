import React, { useState } from 'react'
import { View, StyleSheet, ImageStyle, ViewStyle } from 'react-native'
import FastImage, { Source } from 'react-native-fast-image'
import { useTheme } from '../../services/style/theme/useTheme'

type Props = {
  source: Source
  style?: ImageStyle
  containerStyle?: ViewStyle
  objectFit?: 'contain' | 'cover' | 'fill' | 'scale-down'
}

const AppImage = ({ source, style, containerStyle, objectFit = 'cover' }: Props) => {
  const [loading, setLoading] = useState(true)
  const theme = useTheme()

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {loading && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.skeleton, borderRadius: (style as any)?.borderRadius || 0 }]} />
      )}
      <FastImage
        source={{ ...source }}
        style={[styles.image, style]}
        objectFit={objectFit}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
})

export default React.memo(AppImage)
