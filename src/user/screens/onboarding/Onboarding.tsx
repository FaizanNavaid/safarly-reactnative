import { useRef, useState } from 'react'
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../services/style/theme/useTheme'
import { ThemeColors } from '../../services/style/color/color'
import { scale, storeData } from '../../services/helper/helper'
import { SCREEN } from '../../services/screen-names/ScreenName'
import AppButton from '../../components/buttons/app-button'
import { SafeAreaView } from 'react-native-safe-area-context'

const { width } = Dimensions.get('window')

export default function Onboarding() {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = getStyles(theme)
  const navigation = useNavigation<any>()
  const flatListRef = useRef<FlatList>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const slides = [
    { title: t('onboarding.title1'), desc: t('onboarding.desc1') },
    { title: t('onboarding.title2'), desc: t('onboarding.desc2') },
    { title: t('onboarding.title3'), desc: t('onboarding.desc3') },
  ]

  const finish = () => {
    storeData('onboarding', 'done')
    navigation.reset({ index: 0, routes: [{ name: SCREEN.login }] })
  }

  const next = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 })
    } else {
      finish()
    }
  }

  const isLast = currentIndex === slides.length - 1

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width)
          setCurrentIndex(index)
        }}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>{item.title.charAt(0)}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex && styles.activeDot]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        {!isLast && (
          <Text style={styles.skip} onPress={finish}>
            {t('common.skip')}
          </Text>
        )}
        <AppButton
          title={isLast ? t('common.getStarted') : t('common.next')}
          onPress={next}
          containerStyle={styles.btn}
        />
      </View>
    </View>
    </SafeAreaView>
  )
}

const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.mainBg,
    },
    slide: {
      width,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: scale(30),
    },
    iconCircle: {
      width: scale(120),
      height: scale(120),
      borderRadius: scale(60),
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: scale(30),
    },
    iconText: {
      fontSize: scale(48),
      fontWeight: '800',
      color: theme.white,
    },
    title: {
      fontSize: scale(24),
      fontWeight: '700',
      color: theme.text,
      textAlign: 'center',
      marginBottom: scale(12),
    },
    desc: {
      fontSize: scale(15),
      color: theme.subText,
      textAlign: 'center',
      lineHeight: scale(22),
    },
    dots: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: scale(20),
    },
    dot: {
      width: scale(8),
      height: scale(8),
      borderRadius: scale(4),
      backgroundColor: theme.border,
      marginHorizontal: scale(4),
    },
    activeDot: {
      backgroundColor: theme.primary,
      width: scale(24),
    },
    footer: {
      paddingHorizontal: scale(20),
      paddingBottom: scale(40),
      alignItems: 'center',
    },
    skip: {
      fontSize: scale(14),
      color: theme.subText,
      marginBottom: scale(16),
    },
    btn: {
      width: '100%',
    },
  })
