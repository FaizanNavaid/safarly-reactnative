import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
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
import { DestinationDetail as DestinationDetailType } from '../../../services/interface/interface'
import { BackIcon, StarIcon, LocationIcon } from '../../../assets/icons'
import { SCREEN } from '../../../services/screen-names/ScreenName'
import AppImage from '../../../components/app-image'
import TourCard from '../../../components/cards/TourCard'
import HotelCard from '../../../components/cards/HotelCard'

type ParamList = { DestinationDetail: { slug: string } }

export default function DestinationDetail() {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = getStyles(theme)
  const navigation = useNavigation<NativeStackNavigationProp<any>>()
  const route = useRoute<RouteProp<ParamList, 'DestinationDetail'>>()
  const token = useAppSelector(state => state.user.token)

  const [data, setData] = useState<DestinationDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true)
      setError(false)
      const res = await ApiService.getFromAPI<DestinationDetailType>(
        END_POINT.travel.destinationBySlug(route.params.slug),
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

  const dest = data.destination

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.heroWrap}>
          <AppImage source={{ uri: dest.coverImage }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <SafeAreaView edges={['top']} style={styles.heroNav}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <BackIcon width={scale(18)} height={scale(18)} color={theme.text} />
            </TouchableOpacity>
          </SafeAreaView>
          <View style={styles.heroContent}>
            <Text style={styles.heroName}>{dest.name}</Text>
            <View style={styles.heroRow}>
              <LocationIcon width={scale(12)} height={scale(12)} color="rgba(255,255,255,0.9)" />
              <Text style={styles.heroLocation}>{dest.city}, {dest.country}</Text>
            </View>
          </View>
          <View style={styles.heroRating}>
            <StarIcon width={scale(10)} height={scale(10)} color={theme.copper} />
            <Text style={styles.heroRatingText}>{dest.rating}</Text>
            <Text style={styles.heroReviewCount}>({dest.reviewCount})</Text>
          </View>
        </View>

        <View style={styles.body}>
          {dest.priceLevel && (
            <View style={styles.tagRow}>
              <View style={[styles.tag, { backgroundColor: theme.primaryLight }]}>
                <Text style={[styles.tagText, { color: theme.primary }]}>{dest.priceLevel}</Text>
              </View>
              {dest.estimatedBudget && (
                <Text style={styles.budgetText}>
                  {dest.estimatedBudget.currency} {dest.estimatedBudget.min.toLocaleString()} - {dest.estimatedBudget.max.toLocaleString()}
                </Text>
              )}
            </View>
          )}

          <Text style={styles.description}>{dest.description}</Text>

          {dest.bestTimeToVisit.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('detail.bestTime')}</Text>
              <View style={styles.tagsWrap}>
                {dest.bestTimeToVisit.map((time, i) => (
                  <View key={i} style={styles.chipTag}>
                    <Text style={styles.chipText}>{time}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {dest.highlights.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('detail.highlights')}</Text>
              {dest.highlights.map((h, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{h}</Text>
                </View>
              ))}
            </View>
          )}

          {dest.activities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('detail.activities')}</Text>
              <View style={styles.tagsWrap}>
                {dest.activities.map((a, i) => (
                  <View key={i} style={styles.chipTag}>
                    <Text style={styles.chipText}>{a}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {dest.howToReach && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('detail.howToReach')}</Text>
              {dest.howToReach.byAir && (
                <View style={styles.reachRow}>
                  <Text style={styles.reachLabel}>{t('detail.byAir')}</Text>
                  <Text style={styles.reachValue}>{dest.howToReach.byAir}</Text>
                </View>
              )}
              {dest.howToReach.byRoad && (
                <View style={styles.reachRow}>
                  <Text style={styles.reachLabel}>{t('detail.byRoad')}</Text>
                  <Text style={styles.reachValue}>{dest.howToReach.byRoad}</Text>
                </View>
              )}
              {dest.howToReach.byTrain && (
                <View style={styles.reachRow}>
                  <Text style={styles.reachLabel}>{t('detail.byTrain')}</Text>
                  <Text style={styles.reachValue}>{dest.howToReach.byTrain}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {data.tours.length > 0 && (
          <View style={styles.listSection}>
            <Text style={[styles.sectionTitle, styles.listTitle]}>{t('detail.relatedTours')}</Text>
            <FlatList
              data={data.tours}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <TourCard item={item} onPress={() => navigation.push(SCREEN.tourDetail, { slug: item.slug })} />
              )}
            />
          </View>
        )}

        {data.hotels.length > 0 && (
          <View style={styles.listSection}>
            <Text style={[styles.sectionTitle, styles.listTitle]}>{t('detail.relatedHotels')}</Text>
            <FlatList
              data={data.hotels}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <HotelCard item={item} onPress={() => navigation.push(SCREEN.hotelDetail, { slug: item.slug })} />
              )}
            />
          </View>
        )}

        {data.reviews.length > 0 && (
          <View style={styles.body}>
            <Text style={styles.sectionTitle}>{t('detail.reviews')} ({data.reviews.length})</Text>
            {data.reviews.map(review => (
              <View key={review._id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewUser}>{review.user.firstName} {review.user.lastName}</Text>
                  <View style={styles.reviewRating}>
                    <StarIcon width={scale(9)} height={scale(9)} color={theme.copper} />
                    <Text style={styles.reviewRatingText}>{review.rating}</Text>
                  </View>
                </View>
                {review.title ? <Text style={styles.reviewTitle}>{review.title}</Text> : null}
                <Text style={styles.reviewComment} numberOfLines={4}>{review.comment}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: scale(30) }} />
      </ScrollView>
    </View>
  )
}

const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.mainBg,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.mainBg,
    },
    errorText: { fontSize: scale(14), color: theme.subText, marginBottom: scale(12) },
    retryBtn: { backgroundColor: theme.primary, paddingHorizontal: scale(20), paddingVertical: scale(8), borderRadius: scale(8) },
    retryText: { fontSize: scale(13), fontWeight: '600', color: theme.buttonText },

    heroWrap: { width: '100%', height: scale(240) },
    heroImage: { width: '100%', height: '100%' },
    heroOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.3)' },
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
    heroContent: { position: 'absolute', bottom: scale(14), left: scale(16), right: scale(80) },
    heroName: { fontSize: scale(20), fontWeight: '700', color: '#FFFFFF' },
    heroRow: { flexDirection: 'row', alignItems: 'center', marginTop: scale(4) },
    heroLocation: { fontSize: scale(12), color: 'rgba(255,255,255,0.9)', marginLeft: scale(4) },
    heroRating: {
      position: 'absolute',
      bottom: scale(16),
      right: scale(16),
      backgroundColor: 'rgba(0,0,0,0.5)',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: scale(8),
      paddingVertical: scale(4),
      borderRadius: scale(8),
    },
    heroRatingText: { fontSize: scale(11), fontWeight: '700', color: '#FFFFFF', marginLeft: scale(3) },
    heroReviewCount: { fontSize: scale(10), color: 'rgba(255,255,255,0.7)', marginLeft: scale(2) },

    body: { paddingHorizontal: scale(16), paddingTop: scale(16) },

    tagRow: { flexDirection: 'row', alignItems: 'center', marginBottom: scale(12) },
    tag: { paddingHorizontal: scale(10), paddingVertical: scale(4), borderRadius: scale(6) },
    tagText: { fontSize: scale(11), fontWeight: '600', textTransform: 'capitalize' },
    budgetText: { fontSize: scale(12), color: theme.subText, marginLeft: scale(10) },

    description: { fontSize: scale(13), color: theme.text, lineHeight: scale(20) },

    section: { marginTop: scale(18) },
    sectionTitle: { fontSize: scale(15), fontWeight: '700', color: theme.heading, marginBottom: scale(10) },

    tagsWrap: { flexDirection: 'row', flexWrap: 'wrap' },
    chipTag: {
      backgroundColor: theme.inputBg,
      paddingHorizontal: scale(10),
      paddingVertical: scale(5),
      borderRadius: scale(7),
      marginRight: scale(8),
      marginBottom: scale(8),
    },
    chipText: { fontSize: scale(11), color: theme.text },

    bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: scale(6) },
    bullet: {
      width: scale(5),
      height: scale(5),
      borderRadius: scale(3),
      backgroundColor: theme.primary,
      marginTop: scale(6),
      marginRight: scale(8),
    },
    bulletText: { fontSize: scale(12), color: theme.text, flex: 1, lineHeight: scale(18) },

    reachRow: { marginBottom: scale(10) },
    reachLabel: { fontSize: scale(12), fontWeight: '600', color: theme.heading, marginBottom: scale(2) },
    reachValue: { fontSize: scale(12), color: theme.subText, lineHeight: scale(18) },

    listSection: { marginTop: scale(18) },
    listTitle: { paddingHorizontal: scale(16) },
    listContent: { paddingHorizontal: scale(16) },

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
    reviewRatingText: { fontSize: scale(10), fontWeight: '600', color: theme.text, marginLeft: scale(3) },
    reviewTitle: { fontSize: scale(12), fontWeight: '600', color: theme.heading, marginTop: scale(6) },
    reviewComment: { fontSize: scale(11), color: theme.subText, marginTop: scale(4), lineHeight: scale(17) },
  })
