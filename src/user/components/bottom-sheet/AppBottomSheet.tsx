import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { BackHandler, StyleSheet, Text, View } from 'react-native'
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { useTheme } from '../../services/style/theme/useTheme'
import { ThemeColors } from '../../services/style/color/color'
import { scale } from '../../services/helper/helper'

export type AppBottomSheetRef = {
  open: () => void
  close: () => void
}

type Props = {
  snapPoints?: (string | number)[]
  title?: string
  children: React.ReactNode
  onClose?: () => void
}

const AppBottomSheet = forwardRef<AppBottomSheetRef, Props>(
  ({ snapPoints = ['50%', '80%'], title, children, onClose }, ref) => {
    const theme = useTheme()
    const styles = getStyles(theme)
    const sheetRef = useRef<BottomSheet>(null)
    const [isOpen, setIsOpen] = useState(false)

    useImperativeHandle(ref, () => ({
      open: () => sheetRef.current?.snapToIndex(0),
      close: () => sheetRef.current?.close(),
    }))

    useEffect(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (isOpen) {
          sheetRef.current?.close()
          return true
        }
        return false
      })
      return () => sub.remove()
    }, [isOpen])

    const handleChange = useCallback((index: number) => {
      setIsOpen(index >= 0)
      if (index === -1) onClose?.()
    }, [onClose])

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior="close"
        />
      ),
      [],
    )

    return (
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={handleChange}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.background}
        handleIndicatorStyle={styles.indicator}
      >
        {title && (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>
        )}
        <BottomSheetScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </BottomSheetScrollView>
      </BottomSheet>
    )
  },
)

const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    background: {
      backgroundColor: theme.secondBg,
      borderTopLeftRadius: scale(18),
      borderTopRightRadius: scale(18),
    },
    indicator: {
      backgroundColor: theme.placeholder,
      width: scale(36),
      height: scale(4),
    },
    header: {
      paddingHorizontal: scale(16),
      paddingBottom: scale(10),
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
    },
    title: {
      fontSize: scale(16),
      fontWeight: '700',
      color: theme.heading,
    },
    content: {
      paddingHorizontal: scale(16),
      paddingTop: scale(12),
      paddingBottom: scale(30),
    },
  })

export default AppBottomSheet
