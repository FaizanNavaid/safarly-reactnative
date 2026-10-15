import React, { useCallback, useEffect, useRef, useState } from 'react'
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
import { HotelDetail as HotelDetailType } from '../../../services/interface/interface'
import { BackIcon, StarIcon, LocationIcon } from '../../../assets/icons'
import AppImage from '../../../components/app-image'
import DetailSkeleton from '../../../components/skeleton/DetailSkeleton'
import BookingSheet, { BookingSheetRef } from '../../../components/booking-sheet/BookingSheet'
import { BookingIcon } from '../../../assets/icons'

type ParamList = { HotelDetail: { slug: string } }

export default function HotelDetail() {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = getStyles(theme)
  const navigation = useNavigation<NativeStackNavigationProp<any>>()
  const route = useRoute<RouteProp<ParamList, 'HotelDetail'>>()
  const token = useAppSelector(state => state.user.token)

  const bookingRef = useRef<BookingSheetRef>(null)
  const [data, setData] = useState<HotelDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true)
      setError(false)
      const res = await ApiService.getFromAPI<HotelDetailType>(
        END_POINT.travel.hotelBySlug(route.params.slug),
        token,
      )
      if (res?.success && res?.data) {
        setData(res.data)
      } else {
        setError(true)
      }
    } catch (err:any){
      console.log(err);
      
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [route.params.slug, token])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  if (loading) {
    return <DetailSkeleton />
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

  const hotel = data.hotel
  const stars = Array.from({ length: hotel.starRating }, (_, i) => i)

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.heroWrap}>
          <AppImage source={{ uri: hotel.coverImage }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <SafeAreaView edges={['top']} style={styles.heroNav}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <BackIcon width={scale(18)} height={scale(18)} color={theme.text} />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          <View style={styles.nameRow}>
            <View style={styles.nameFlex}>
              <Text style={styles.name}>{hotel.name}</Text>
              <View style={styles.starsRow}>
                {stars.map(i => (
                  <StarIcon key={i} width={scale(10)} height={scale(10)} color={theme.copper} />
                ))}
              </View>
            </View>
            <View style={styles.ratingPill}>
              <StarIcon width={scale(9)} height={scale(9)} color={theme.copper} />
              <Text style={styles.ratingVal}>{hotel.rating} ({hotel.reviewCount})</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <LocationIcon width={scale(11)} height={scale(11)} color={theme.subText} />
            <Text style={styles.address} numberOfLines={2}>{hotel.address}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{hotel.currency} {hotel.pricePerNight.toLocaleString()}</Text>
            <Text style={styles.perNight}> / {t('home.perNight')}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.description}>{hotel.description}</Text>

          {hotel.amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('detail.amenities')}</Text>
              <View style={styles.tagsWrap}>
                {hotel.amenities.map((a, i) => (
                  <View key={i} style={styles.chipTag}>
                    <Text style={styles.chipText}>{a}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {hotel.roomTypes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('detail.roomTypes')}</Text>
              {hotel.roomTypes.map((room, i) => (
                <View key={i} style={styles.roomCard}>
                  <View style={styles.roomHeader}>
                    <Text style={styles.roomName}>{room.name}</Text>
                    <Text style={styles.roomPrice}>{hotel.currency} {room.pricePerNight.toLocaleString()}</Text>
                  </View>
                  {room.bedType && <Text style={styles.roomMeta}>{room.bedType} · {t('detail.maxGuests')}: {room.maxOccupancy}</Text>}
                  {room.amenities.length > 0 && (
                    <View style={styles.roomAmenities}>
                      {room.amenities.slice(0, 4).map((a, j) => (
                        <Text key={j} style={styles.roomAmenityText}>{a}</Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('detail.timings')}</Text>
            <View style={styles.timingRow}>
              <View style={styles.timingBox}>
                <Text style={styles.timingLabel}>{t('detail.checkIn')}</Text>
                <Text style={styles.timingValue}>{hotel.checkIn}</Text>
              </View>
              <View style={styles.timingBox}>
                <Text style={styles.timingLabel}>{t('detail.checkOut')}</Text>
                <Text style={styles.timingValue}>{hotel.checkOut}</Text>
              </View>
            </View>
          </View>

          {hotel.policies.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('detail.policies')}</Text>
              {hotel.policies.map((p, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{p}</Text>
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

        <View style={{ height: scale(80) }} />
      </ScrollView>

      <View style={styles.bookBtnWrap}>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => bookingRef.current?.open()}
          activeOpacity={0.7}
        >
          <BookingIcon width={scale(16)} height={scale(16)} color={theme.buttonText} />
          <Text style={styles.bookBtnText}>{t('booking.bookNow')}</Text>
        </TouchableOpacity>
      </View>

      <BookingSheet
        ref={bookingRef}
        config={{
          bookingType: 'hotel',
          hotelId: hotel._id,
          hotelName: hotel.name,
          roomTypes: hotel.roomTypes.map(rt => ({
            name: rt.name,
            pricePerNight: rt.pricePerNight,
          })),
        }}
      />
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

    nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    nameFlex: { flex: 1, marginRight: scale(10) },
    name: { fontSize: scale(18), fontWeight: '700', color: theme.heading },
    starsRow: { flexDirection: 'row', marginTop: scale(4) },
    ratingPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.inputBg,
      paddingHorizontal: scale(7),
      paddingVertical: scale(4),
      borderRadius: scale(6),
    },
    ratingVal: { fontSize: scale(10), fontWeight: '600', color: theme.text, marginLeft: scale(3) },

    locationRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: scale(8) },
    address: { fontSize: scale(12), color: theme.subText, marginLeft: scale(4), flex: 1, lineHeight: scale(17) },

    priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: scale(12) },
    price: { fontSize: scale(18), fontWeight: '700', color: theme.primary },
    perNight: { fontSize: scale(11), color: theme.subText },

    divider: { height: 1, backgroundColor: theme.divider, marginVertical: scale(14) },
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

    roomCard: {
      backgroundColor: theme.cardBg,
      borderRadius: scale(10),
      padding: scale(12),
      marginBottom: scale(10),
      borderWidth: 1,
      borderColor: theme.border,
    },
    roomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    roomName: { fontSize: scale(13), fontWeight: '600', color: theme.text },
    roomPrice: { fontSize: scale(12), fontWeight: '700', color: theme.primary },
    roomMeta: { fontSize: scale(10), color: theme.subText, marginTop: scale(4) },
    roomAmenities: { flexDirection: 'row', flexWrap: 'wrap', marginTop: scale(6) },
    roomAmenityText: {
      fontSize: scale(9),
      color: theme.subText,
      backgroundColor: theme.inputBg,
      paddingHorizontal: scale(6),
      paddingVertical: scale(2),
      borderRadius: scale(4),
      marginRight: scale(5),
      marginBottom: scale(4),
      overflow: 'hidden',
    },

    timingRow: { flexDirection: 'row' },
    timingBox: {
      flex: 1,
      backgroundColor: theme.cardBg,
      borderRadius: scale(10),
      padding: scale(12),
      marginRight: scale(10),
      borderWidth: 1,
      borderColor: theme.border,
    },
    timingLabel: { fontSize: scale(10), color: theme.subText },
    timingValue: { fontSize: scale(14), fontWeight: '600', color: theme.text, marginTop: scale(4) },

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

    bookBtnWrap: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: scale(16),
      paddingBottom: scale(20),
      paddingTop: scale(10),
      backgroundColor: theme.mainBg,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },
    bookBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.primary,
      height: scale(48),
      borderRadius: scale(12),
      gap: scale(8),
    },
    bookBtnText: {
      fontSize: scale(15),
      fontWeight: '700',
      color: theme.buttonText,
    },
  })
