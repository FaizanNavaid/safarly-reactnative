import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useTheme } from '../../../services/style/theme/useTheme'
import { ThemeColors } from '../../../services/style/color/color'
import { scale } from '../../../services/helper/helper'
import { useAppSelector } from '../../../config/redux/store/Store'
import { ApiService } from '../../../services/api/ApiService'
import { END_POINT } from '../../../services/api/endPoint'
import { Booking, BookingStatus } from '../../../services/interface/interface'
import { SCREEN } from '../../../services/screen-names/ScreenName'
import { LocationIcon } from '../../../assets/icons'
import AppImage from '../../../components/app-image'
import AppBottomSheet, { AppBottomSheetRef } from '../../../components/bottom-sheet/AppBottomSheet'
import AppStatusBar from '../../../components/status-bar/AppStatusBar'

const STATUS_FILTERS: (BookingStatus | 'all')[] = ['all', 'pending', 'confirmed', 'completed', 'cancelled']

export default function Bookings() {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = getStyles(theme)
  const navigation = useNavigation<NativeStackNavigationProp<any>>()
  const token = useAppSelector(state => state.user.token)

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeFilter, setActiveFilter] = useState<BookingStatus | 'all'>('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const sheetRef = useRef<AppBottomSheetRef>(null)

  const fetchBookings = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      const params: Record<string, any> = {}
      if (activeFilter !== 'all') params.status = activeFilter

      const res = await ApiService.getFromAPI<Booking[]>(
        END_POINT.bookings.myBookings,
        token,
        params,
      )

      if (res?.success) {
        const list = Array.isArray(res.data) ? res.data : (res as any)?.data?.data || []
        setBookings(list)
      }
    } catch {
      setBookings([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token, activeFilter])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const handleCancel = useCallback(async () => {
    if (!selectedBooking) return
    try {
      setCancelling(true)
      await ApiService.patchFromAPI(
        END_POINT.bookings.cancel(selectedBooking.bookingNumber),
        { reason: t('booking.cancelledByUser') },
        token,
      )
      sheetRef.current?.close()
      fetchBookings()
    } catch {
    } finally {
      setCancelling(false)
    }
  }, [selectedBooking, token, fetchBookings, t])

  const openDetail = (booking: Booking) => {
    setSelectedBooking(booking)
    sheetRef.current?.open()
  }

  const getStatusColor = (status: BookingStatus) => {
    const map: Record<BookingStatus, string> = {
      pending: theme.warning,
      confirmed: theme.info,
      'in-progress': theme.primary,
      completed: theme.success,
      cancelled: theme.error,
      refunded: theme.placeholder,
    }
    return map[status] || theme.subText
  }

  const renderFilter = (filter: BookingStatus | 'all') => {
    const isActive = activeFilter === filter
    return (
      <TouchableOpacity
        key={filter}
        style={[styles.filterPill, isActive && { backgroundColor: theme.primary }]}
        onPress={() => setActiveFilter(filter)}
        activeOpacity={0.7}
      >
        <Text style={[styles.filterText, isActive && { color: theme.buttonText }]}>
          {t(`booking.${filter}`)}
        </Text>
      </TouchableOpacity>
    )
  }

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const image = item.tourPackage?.coverImage || item.hotel?.coverImage || item.destination?.coverImage
    const title = item.tourPackage?.title || item.hotel?.name || item.destination?.name
    const statusColor = getStatusColor(item.status)

    return (
      <TouchableOpacity style={styles.card} onPress={() => openDetail(item)} activeOpacity={0.8}>
        <View style={styles.cardImage}>
          <AppImage source={{ uri: image || '' }} style={styles.cardImg} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
          <View style={styles.cardRow}>
            <LocationIcon width={scale(9)} height={scale(9)} color={theme.subText} />
            <Text style={styles.cardLocation} numberOfLines={1}>{item.destination?.city}</Text>
          </View>
          <Text style={styles.cardDate}>
            {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
          </Text>
          <View style={styles.cardBottom}>
            <Text style={styles.cardPrice}>{item.pricing?.currency} {item.pricing?.total?.toLocaleString()}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{t(`booking.${item.status}`)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const renderEmpty = () => (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyTitle}>{t('booking.noBookings')}</Text>
      <Text style={styles.emptySubtitle}>{t('booking.noBookingsDesc')}</Text>
    </View>
  )

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.heading}>{t('tab.bookings')}</Text>
      </View>

      <View style={styles.filtersRow}>
        <FlatList
          data={STATUS_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
          keyExtractor={item => item}
          renderItem={({ item }) => renderFilter(item)}
        />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={item => item._id}
          renderItem={renderBookingCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchBookings(true)}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate(SCREEN.bookingStepOne)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AppBottomSheet ref={sheetRef} title={selectedBooking?.bookingNumber} snapPoints={['55%', '85%']}>
        {selectedBooking && (
          <View style={styles.sheetContent}>
            <View style={styles.sheetHero}>
              <AppImage
                source={{ uri: selectedBooking.tourPackage?.coverImage || selectedBooking.hotel?.coverImage || selectedBooking.destination?.coverImage || '' }}
                style={styles.sheetImage}
              />
              <View style={styles.sheetHeroInfo}>
                <Text style={styles.sheetDestination} numberOfLines={2}>
                  {selectedBooking.tourPackage?.title || selectedBooking.hotel?.name || selectedBooking.destination?.name || t('booking.destination')}
                </Text>
                <View style={styles.sheetLocation}>
                  <LocationIcon width={scale(11)} height={scale(11)} color={theme.subText} />
                  <Text style={styles.sheetLocationText} numberOfLines={1}>
                    {selectedBooking.destination?.city || selectedBooking.destination?.name || ''}
                  </Text>
                </View>
                <View style={[styles.sheetStatus, { backgroundColor: getStatusColor(selectedBooking.status) + '20' }]}>
                  <View style={[styles.sheetStatusDot, { backgroundColor: getStatusColor(selectedBooking.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(selectedBooking.status) }]}>
                    {t(`booking.${selectedBooking.status}`)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.sheetDetailsCard}>
              <View style={styles.sheetRow}>
                <Text style={styles.sheetLabel}>{t('booking.type')}</Text>
                <Text style={styles.sheetValue}>{selectedBooking.bookingType}</Text>
              </View>
              <View style={styles.sheetRow}>
                <Text style={styles.sheetLabel}>{t('booking.dates')}</Text>
                <Text style={styles.sheetValue}>
                  {new Date(selectedBooking.startDate).toLocaleDateString()} - {new Date(selectedBooking.endDate).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.sheetRow}>
                <Text style={styles.sheetLabel}>{t('booking.guests')}</Text>
                <Text style={styles.sheetValue}>
                  {selectedBooking.guests.adults} {t('booking.adults')}
                  {selectedBooking.guests.children > 0 ? `, ${selectedBooking.guests.children} ${t('booking.children')}` : ''}
                </Text>
              </View>
              <View style={styles.sheetRow}>
                <Text style={styles.sheetLabel}>{t('booking.traveler')}</Text>
                <Text style={styles.sheetValue}>{selectedBooking.leadTraveler?.firstName} {selectedBooking.leadTraveler?.lastName}</Text>
              </View>
              <View style={[styles.sheetRow, styles.sheetLastRow]}>
                <Text style={styles.sheetLabel}>{t('booking.payment')}</Text>
                <Text style={styles.sheetValue}>{selectedBooking.payment?.method}</Text>
              </View>
            </View>

            <View style={styles.sheetTotalCard}>
              <View>
                <Text style={styles.sheetLabel}>{t('booking.total')}</Text>
                <Text style={styles.sheetTotalCaption}>{t('booking.payment')}</Text>
              </View>
              <Text style={styles.sheetTotalValue}>
                {selectedBooking.pricing?.currency} {selectedBooking.pricing?.total?.toLocaleString()}
              </Text>
            </View>

            {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleCancel}
                disabled={cancelling}
                activeOpacity={0.7}
              >
                {cancelling ? (
                  <ActivityIndicator size="small" color={theme.white} />
                ) : (
                  <Text style={styles.cancelText}>{t('booking.cancelBooking')}</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </AppBottomSheet>
    </SafeAreaView>
  )
}

const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.mainBg },
    header: { paddingHorizontal: scale(16), paddingTop: scale(6), paddingBottom: scale(8) },
    heading: { fontSize: scale(20), fontWeight: '700', color: theme.heading },

    filtersRow: { marginBottom: scale(4) },
    filtersList: { paddingHorizontal: scale(16) },
    filterPill: {
      paddingHorizontal: scale(14),
      paddingVertical: scale(6),
      borderRadius: scale(8),
      backgroundColor: theme.inputBg,
      marginRight: scale(8),
    },
    filterText: { fontSize: scale(11), fontWeight: '600', color: theme.subText, textTransform: 'capitalize' },

    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { paddingHorizontal: scale(16), paddingTop: scale(8), paddingBottom: scale(80) },

    card: {
      flexDirection: 'row',
      backgroundColor: theme.cardBg,
      borderRadius: scale(12),
      marginBottom: scale(10),
      overflow: 'hidden',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 1,
    },
    cardImage: { width: scale(85), height: scale(95) },
    cardImg: { width: '100%', height: '100%' },
    cardInfo: { flex: 1, padding: scale(10), justifyContent: 'space-between' },
    cardTitle: { fontSize: scale(13), fontWeight: '600', color: theme.text },
    cardRow: { flexDirection: 'row', alignItems: 'center', marginTop: scale(2) },
    cardLocation: { fontSize: scale(10), color: theme.subText, marginLeft: scale(3) },
    cardDate: { fontSize: scale(9), color: theme.placeholder, marginTop: scale(2) },
    cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: scale(4) },
    cardPrice: { fontSize: scale(12), fontWeight: '700', color: theme.primary },
    statusBadge: { paddingHorizontal: scale(7), paddingVertical: scale(2), borderRadius: scale(5) },
    statusText: { fontSize: scale(9), fontWeight: '600', textTransform: 'capitalize' },

    emptyWrap: { alignItems: 'center', paddingTop: scale(60) },
    emptyTitle: { fontSize: scale(15), fontWeight: '600', color: theme.text },
    emptySubtitle: { fontSize: scale(12), color: theme.subText, marginTop: scale(6), textAlign: 'center' },

    fab: {
      position: 'absolute',
      bottom: scale(20),
      right: scale(20),
      width: scale(48),
      height: scale(48),
      borderRadius: scale(14),
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 5,
    },
    fabText: { fontSize: scale(24), fontWeight: '300', color: theme.buttonText, marginTop: -scale(1) },

    sheetRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: scale(7),
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
    },
    sheetContent: { paddingBottom: scale(4) },
    sheetHero: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: scale(10),
      backgroundColor: theme.cardBg,
      borderRadius: scale(14),
      marginBottom: scale(14),
    },
    sheetImage: { width: scale(82), height: scale(82), borderRadius: scale(10), backgroundColor: theme.inputBg },
    sheetHeroInfo: { flex: 1, marginLeft: scale(12), alignItems: 'flex-start' },
    sheetDestination: { fontSize: scale(15), lineHeight: scale(20), fontWeight: '700', color: theme.heading },
    sheetLocation: { flexDirection: 'row', alignItems: 'center', marginTop: scale(5) },
    sheetLocationText: { fontSize: scale(11), color: theme.subText, marginLeft: scale(5) },
    sheetStatus: { flexDirection: 'row', alignItems: 'center', borderRadius: scale(20), paddingHorizontal: scale(9), paddingVertical: scale(5), marginTop: scale(9) },
    sheetStatusDot: { width: scale(6), height: scale(6), borderRadius: scale(3), marginRight: scale(5) },
    sheetDetailsCard: { paddingHorizontal: scale(12), paddingTop: scale(11), backgroundColor: theme.cardBg, borderRadius: scale(14) },
    sheetLastRow: { borderBottomWidth: 0 },
    sheetTotalCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: scale(14), marginTop: scale(12), borderRadius: scale(14), backgroundColor: theme.inputBg },
    sheetTotalCaption: { fontSize: scale(10), color: theme.placeholder, marginTop: scale(3) },
    sheetTotalValue: { fontSize: scale(16), fontWeight: '800', color: theme.primary },
    sheetLabel: { fontSize: scale(12), color: theme.subText },
    sheetValue: { fontSize: scale(12), fontWeight: '500', color: theme.text, maxWidth: '60%', textAlign: 'right' },

    cancelBtn: {
      backgroundColor: theme.error,
      height: scale(42),
      borderRadius: scale(10),
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: scale(18),
    },
    cancelText: { fontSize: scale(14), fontWeight: '600', color: theme.white },
  })
