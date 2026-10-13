import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useTheme } from '../../../services/style/theme/useTheme'
import { ThemeColors } from '../../../services/style/color/color'
import { scale } from '../../../services/helper/helper'
import { useAppSelector } from '../../../config/redux/store/Store'
import { ApiService } from '../../../services/api/ApiService'
import { END_POINT } from '../../../services/api/endPoint'
import { TourDetail as TourDetailType } from '../../../services/interface/interface'
import { BackIcon, StarIcon, LocationIcon } from '../../../assets/icons'
import AppImage from '../../../components/app-image'

type ParamList = { TourDetail: { slug: string } }

export default function TourDetail() {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = getStyles(theme)
  const navigation = useNavigation<NativeStackNavigationProp<any>>()
  const route = useRoute<RouteProp<ParamList, 'TourDetail'>>()
  const token = useAppSelector(state => state.user.token)

  const [data, setData] = useState<TourDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true)
      setError(false)
      const res = await ApiService.getFromAPI<TourDetailType>(
        END_POINT.travel.tourBySlug(route.params.slug),
        token,
      )
      if (res?.success && res?.data) {
        setData(res.data)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [route.params.slug, token])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    )
  }

  if (error || !data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{t('detail.errorLoading')}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchDetail} activeOpacity={0.7}>
          <Text style={styles.retryText}>{t('home.retry')}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const tour = data.tour
  const hasDiscount = tour.discountPrice && tour.discountPrice < tour.price

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.heroWrap}>
          <AppImage source={{ uri: tour.coverImage }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <SafeAreaView edges={['top']} style={styles.heroNav}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <BackIcon width={scale(18)} height={scale(18)} color={theme.text} />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{tour.title}</Text>

          <View style={styles.metaRow}>
            <LocationIcon width={scale(11)} height={scale(11)} color={theme.subText} />
            <Text style={styles.metaText}>{tour.destination?.name}</Text>
          </View>

          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.badgeText, { color: theme.primary }]}>
                {tour.duration.days}D / {tour.duration.nights}N
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: theme.warningLight }]}>
              <Text style={[styles.badgeText, { color: theme.warning }]}>{tour.difficulty}</Text>
            </View>
            <View style={styles.ratingPill}>
              <StarIcon width={scale(9)} height={scale(9)} color={theme.copper} />
              <Text style={styles.ratingText}>{tour.rating} ({tour.reviewCount})</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            {hasDiscount && (
              <Text style={styles.oldPrice}>{tour.currency} {tour.price.toLocaleString()}</Text>
            )}
            <Text style={styles.price}>
              {tour.currency} {(hasDiscount ? tour.discountPrice! : tour.price).toLocaleString()}
            </Text>
            <Text style={styles.perPerson}>{t('detail.perPerson')}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.description}>{tour.description}</Text>

          {tour.includes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('detail.includes')}</Text>
              {tour.includes.map((item, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={[styles.listIcon, { color: theme.success }]}>+</Text>
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {tour.excludes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('detail.excludes')}</Text>
              {tour.excludes.map((item, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={[styles.listIcon, { color: theme.error }]}>-</Text>
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {tour.itinerary.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('detail.itinerary')}</Text>
              {tour.itinerary.map(day => (
                <View key={day.day} style={styles.dayCard}>
                  <View style={styles.dayBadge}>
                    <Text style={styles.dayBadgeText}>{t('detail.day')} {day.day}</Text>
                  </View>
                  <Text style={styles.dayTitle}>{day.title}</Text>
                  <Text style={styles.dayDesc}>{day.description}</Text>
                  {day.meals ? <Text style={styles.dayExtra}>{day.meals}</Text> : null}
                </View>
              ))}
            </View>
          )}

          {data.reviews.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('detail.reviews')} ({data.reviews.length})</Text>
              {data.reviews.map(review => (
                <View key={review._id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewUser}>{review.user.firstName} {review.user.lastName}</Text>
                    <View style={styles.reviewRating}>
                      <StarIcon width={scale(9)} height={scale(9)} color={theme.copper} />
                      <Text style={styles.reviewRatingVal}>{review.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewComment} numberOfLines={3}>{review.comment}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: scale(30) }} />
      </ScrollView>
    </View>
  )
}

const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.mainBg },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.mainBg },
    errorText: { fontSize: scale(14), color: theme.subText, marginBottom: scale(12) },
    retryBtn: { backgroundColor: theme.primary, paddingHorizontal: scale(20), paddingVertical: scale(8), borderRadius: scale(8) },
    retryText: { fontSize: scale(13), fontWeight: '600', color: theme.buttonText },

    heroWrap: { width: '100%', height: scale(220) },
    heroImage: { width: '100%', height: '100%' },
    heroOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.2)' },
    heroNav: { position: 'absolute', top: 0, left: 0, right: 0 },
    backBtn: {
      width: scale(34),
      height: scale(34),
      borderRadius: scale(10),
      backgroundColor: theme.cardBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: scale(16),
      marginTop: scale(6),
    },

    body: { paddingHorizontal: scale(16), paddingTop: scale(16) },

    title: { fontSize: scale(18), fontWeight: '700', color: theme.heading, lineHeight: scale(24) },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: scale(6) },
    metaText: { fontSize: scale(12), color: theme.subText, marginLeft: scale(4) },

    badgeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: scale(10) },
    badge: { paddingHorizontal: scale(9), paddingVertical: scale(4), borderRadius: scale(6), marginRight: scale(8), marginBottom: scale(4) },
    badgeText: { fontSize: scale(10), fontWeight: '600', textTransform: 'capitalize' },
    ratingPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.inputBg,
      paddingHorizontal: scale(7),
      paddingVertical: scale(4),
      borderRadius: scale(6),
      marginBottom: scale(4),
    },
    ratingText: { fontSize: scale(10), fontWeight: '600', color: theme.text, marginLeft: scale(3) },

    priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: scale(12) },
    oldPrice: { fontSize: scale(13), color: theme.placeholder, textDecorationLine: 'line-through', marginRight: scale(8) },
    price: { fontSize: scale(18), fontWeight: '700', color: theme.primary },
    perPerson: { fontSize: scale(10), color: theme.subText, marginLeft: scale(4) },

    divider: { height: 1, backgroundColor: theme.divider, marginVertical: scale(14) },
    description: { fontSize: scale(13), color: theme.text, lineHeight: scale(20) },

    section: { marginTop: scale(18) },
    sectionTitle: { fontSize: scale(15), fontWeight: '700', color: theme.heading, marginBottom: scale(10) },

    listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: scale(6) },
    listIcon: { fontSize: scale(14), fontWeight: '700', width: scale(16) },
    listText: { fontSize: scale(12), color: theme.text, flex: 1, lineHeight: scale(18) },

    dayCard: {
      backgroundColor: theme.cardBg,
      borderRadius: scale(10),
      padding: scale(12),
      marginBottom: scale(10),
      borderWidth: 1,
      borderColor: theme.border,
    },
    dayBadge: { backgroundColor: theme.primaryLight, paddingHorizontal: scale(8), paddingVertical: scale(3), borderRadius: scale(5), alignSelf: 'flex-start' },
    dayBadgeText: { fontSize: scale(10), fontWeight: '600', color: theme.primary },
    dayTitle: { fontSize: scale(13), fontWeight: '600', color: theme.heading, marginTop: scale(6) },
    dayDesc: { fontSize: scale(11), color: theme.subText, marginTop: scale(4), lineHeight: scale(17) },
    dayExtra: { fontSize: scale(10), color: theme.placeholder, marginTop: scale(4) },

    reviewCard: {
      backgroundColor: theme.cardBg,
      borderRadius: scale(10),
      padding: scale(12),
      marginBottom: scale(10),
      borderWidth: 1,
      borderColor: theme.border,
    },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    reviewUser: { fontSize: scale(12), fontWeight: '600', color: theme.text },
    reviewRating: { flexDirection: 'row', alignItems: 'center' },
    reviewRatingVal: { fontSize: scale(10), fontWeight: '600', color: theme.text, marginLeft: scale(3) },
    reviewComment: { fontSize: scale(11), color: theme.subText, marginTop: scale(6), lineHeight: scale(17) },
  })
