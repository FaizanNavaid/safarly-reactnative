import React, { useEffect } from 'react'
import { StyleSheet, ViewStyle } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated'
import { useTheme } from '../../services/style/theme/useTheme'

type Props = {
  width: number | `${number}%`
  height: number
  borderRadius?: number
  style?: ViewStyle
}

export default function SkeletonBox({ width, height, borderRadius = 8, style }: Props) {
  const theme = useTheme()
  const pulse = useSharedValue(0)

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true)
  }, [])

  const animStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.4, 1]),
  }))

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.skeleton,
        },
        animStyle,
        style,
      ]}
    />
  )
}
