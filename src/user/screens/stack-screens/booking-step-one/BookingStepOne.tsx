import React, { useCallback, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import DateTimePicker, { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker'

import { useTheme } from '../../../services/style/theme/useTheme'
import { ThemeColors } from '../../../services/style/color/color'
import { scale } from '../../../services/helper/helper'
import { useAppSelector } from '../../../config/redux/store/Store'
import { ApiService } from '../../../services/api/ApiService'
import { END_POINT } from '../../../services/api/endPoint'
import { SCREEN } from '../../../services/screen-names/ScreenName'
import { BookingType, Guests, TourPackage, Hotel } from '../../../services/interface/interface'
import InputField from '../../../components/input-field'
import AppButton from '../../../components/buttons/app-button'
import CustomHeader from '../../../components/custom-header'
import AppBottomSheet, { AppBottomSheetRef } from '../../../components/bottom-sheet/AppBottomSheet'
import AppImage from '../../../components/app-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import AppStatusBar from '../../../components/status-bar/AppStatusBar'

type RouteParams = {
  BookingStepOne: {
    bookingType?: BookingType
    tourId?: string
    tourTitle?: string
    hotelId?: string
    hotelName?: string
    roomTypes?: { name: string; pricePerNight: number }[]
  }
}

type DatePickerModalProps = {
  visible: boolean
  title: string
  selectedDate: string
  date: Date
  minimumDate: Date
  onChange: (event: DateTimePickerEvent, date?: Date) => void
  onCancel: () => void
  onConfirm: () => void
  cancelLabel: string
  confirmLabel: string
  theme: ThemeColors
  styles: ReturnType<typeof getStyles>
}

function DatePickerModal({
  visible,
  title,
  selectedDate,
  date,
  minimumDate,
  onChange,
  onCancel,
  onConfirm,
  cancelLabel,
  confirmLabel,
  theme,
  styles,
}: DatePickerModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.dateModalOverlay}>
        <View style={styles.dateModalCard}>
          <Text style={styles.dateModalTitle}>{title}</Text>
          <Text style={styles.dateModalSelected}>{selectedDate}</Text>
          <DateTimePicker
            value={date}
            mode="date"
            minimumDate={minimumDate}
            onChange={onChange}
            display="spinner"
            textColor={theme.text}
            style={styles.datePicker}
          />
          <View style={styles.dateModalActions}>
            <TouchableOpacity onPress={onCancel} style={styles.dateCancelButton} activeOpacity={0.7}>
              <Text style={styles.dateCancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={styles.dateConfirmButton} activeOpacity={0.7}>
              <Text style={styles.dateConfirmText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default function BookingStepOne() {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = getStyles(theme)
  const navigation = useNavigation<NativeStackNavigationProp<any>>()
  const route = useRoute<RouteProp<RouteParams, 'BookingStepOne'>>()
  const token = useAppSelector(state => state.user.token)

  const params = route.params || {}
  const [bookingType, setBookingType] = useState<BookingType>(params.bookingType || 'tour')

  const [selectedTourId, setSelectedTourId] = useState(params.tourId || '')
  const [selectedTourTitle, setSelectedTourTitle] = useState(params.tourTitle || '')
  const [selectedHotelId, setSelectedHotelId] = useState(params.hotelId || '')
  const [selectedHotelName, setSelectedHotelName] = useState(params.hotelName || '')
  const [roomTypes, setRoomTypes] = useState(params.roomTypes || [])

  const [startDate, setStartDate] = useState(new Date(Date.now() + 7 * 86400000))
  const [endDate, setEndDate] = useState(new Date(Date.now() + 10 * 86400000))
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)
  const [draftStartDate, setDraftStartDate] = useState(startDate)
  const [draftEndDate, setDraftEndDate] = useState(endDate)

  const [guests, setGuests] = useState<Guests>({ adults: 1, children: 0, infants: 0 })
  const [pickupLocation, setPickupLocation] = useState('')
  const [selectedRoomType, setSelectedRoomType] = useState(params.roomTypes?.[0]?.name || '')
  const [roomsCount, setRoomsCount] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const sheetRef = useRef<AppBottomSheetRef>(null)
  const [tours, setTours] = useState<TourPackage[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [listLoading, setListLoading] = useState(false)
  const [sheetType, setSheetType] = useState<'tour' | 'hotel'>('tour')

  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  const applyStartDate = (date: Date) => {
    setStartDate(date)
    if (date >= endDate) setEndDate(new Date(date.getTime() + 86400000))
  }

  const openStartPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: startDate,
        mode: 'date',
        minimumDate: new Date(),
        positiveButton: { label: t('common.ok'), textColor: theme.primary },
        negativeButton: { label: t('common.cancel'), textColor: theme.error },
        onChange: (event, date) => {
          if (event.type === 'set' && date) applyStartDate(date)
        },
      })
      return
    }
    setDraftStartDate(startDate)
    setShowStartPicker(true)
  }

  const openEndPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: endDate,
        mode: 'date',
        minimumDate: new Date(startDate.getTime() + 86400000),
        positiveButton: { label: t('common.ok'), textColor: theme.primary },
        negativeButton: { label: t('common.cancel'), textColor: theme.error },
        onChange: (event, date) => {
          if (event.type === 'set' && date) setEndDate(date)
        },
      })
      return
    }
    setDraftEndDate(endDate)
    setShowEndPicker(true)
  }

  const onStartChange = (_: DateTimePickerEvent, date?: Date) => {
    if (date) setDraftStartDate(date)
  }

  const onEndChange = (_: DateTimePickerEvent, date?: Date) => {
    if (date) setDraftEndDate(date)
  }

  const fetchList = useCallback(async (type: 'tour' | 'hotel') => {
    try {
      setListLoading(true)
      if (type === 'tour') {
        const res = await ApiService.getFromAPI<TourPackage[]>(END_POINT.travel.tours, token)
        if (res?.success) {
          const list = Array.isArray(res.data) ? res.data : (res as any)?.data?.data || []
          setTours(list)
        }
      } else {
        const res = await ApiService.getFromAPI<Hotel[]>(END_POINT.travel.hotels, token)
        if (res?.success) {
          const list = Array.isArray(res.data) ? res.data : (res as any)?.data?.data || []
          setHotels(list)
        }
      }
    } catch {} finally {
      setListLoading(false)
    }
  }, [token])

  const openSelector = (type: 'tour' | 'hotel') => {
    setSheetType(type)
    fetchList(type)
    sheetRef.current?.open()
  }

  const selectTour = (tour: TourPackage) => {
    setSelectedTourId(tour._id)
    setSelectedTourTitle(tour.title)
    setErrors(prev => ({ ...prev, tour: '' }))
    sheetRef.current?.close()
  }

  const selectHotel = (hotel: Hotel) => {
    setSelectedHotelId(hotel._id)
    setSelectedHotelName(hotel.name)
    setRoomTypes(hotel.roomTypes.map(rt => ({ name: rt.name, pricePerNight: rt.pricePerNight })))
    setSelectedRoomType(hotel.roomTypes[0]?.name || '')
    setErrors(prev => ({ ...prev, hotel: '', roomType: hotel.roomTypes[0]?.name ? '' : prev.roomType }))
    sheetRef.current?.close()
  }

  const updateGuest = (key: keyof Guests, delta: number) => {
    setGuests(prev => {
      const val = (prev[key] || 0) + delta
      const min = key === 'adults' ? 1 : 0
      return { ...prev, [key]: Math.max(min, val) }
    })
  }

  const validate = () => {
    const e: Record<string, string> = {}
    const required = t('booking.required')
    if (bookingType === 'tour' && !selectedTourId) e.tour = required
    if (bookingType === 'hotel' && !selectedHotelId) e.hotel = required
    if (bookingType === 'hotel' && !selectedRoomType) e.roomType = required
    if (!pickupLocation.trim()) e.pickupLocation = required
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleContinue = () => {
    if (!validate()) return
    navigation.navigate(SCREEN.bookingStepTwo, {
      bookingType,
      tourId: selectedTourId,
      hotelId: selectedHotelId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      guests,
      pickupLocation,
      roomTypeName: selectedRoomType,
      roomsCount,
    })
  }

  const renderCounter = (label: string, value: number, key: keyof Guests) => (
    <View style={styles.counterRow}>
      <Text style={styles.counterLabel}>{label}</Text>
      <View style={styles.counterControls}>
        <TouchableOpacity
          style={[styles.counterBtn, value <= (key === 'adults' ? 1 : 0) && styles.counterDisabled]}
          onPress={() => updateGuest(key, -1)}
          disabled={value <= (key === 'adults' ? 1 : 0)}
          activeOpacity={0.7}
        >
          <Text style={styles.counterBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.counterValue}>{value}</Text>
        <TouchableOpacity style={styles.counterBtn} onPress={() => updateGuest(key, 1)} activeOpacity={0.7}>
          <Text style={styles.counterBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
   <>
   <SafeAreaView style={{flex:1}} edges={['top']}>
    <AppStatusBar />
      <CustomHeader title={t('booking.stepOneTitle')} />
     <View style={styles.safe}>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{t('booking.bookingType')}</Text>
        <View style={styles.typeRow}>
          {(['tour', 'hotel'] as BookingType[]).map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.typePill, bookingType === type && styles.typePillActive]}
              onPress={() => setBookingType(type)}
              activeOpacity={0.7}
            >
              <Text style={[styles.typeText, bookingType === type && styles.typeTextActive]}>
                {t(`booking.${type}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {bookingType === 'tour' && (
          <TouchableOpacity style={styles.selectedItem} onPress={() => openSelector('tour')} activeOpacity={0.7}>
            <Text style={styles.selectedLabel}>{t('booking.selectTour')}</Text>
            <Text style={[styles.selectedValue, !selectedTourTitle && { color: theme.placeholder }]}>
              {selectedTourTitle || t('booking.selectTour')}
            </Text>
            {errors.tour && <Text style={styles.errorText}>{errors.tour}</Text>}
          </TouchableOpacity>
        )}

        {bookingType === 'hotel' && (
          <>
            <TouchableOpacity style={styles.selectedItem} onPress={() => openSelector('hotel')} activeOpacity={0.7}>
              <Text style={styles.selectedLabel}>{t('booking.selectHotel')}</Text>
              <Text style={[styles.selectedValue, !selectedHotelName && { color: theme.placeholder }]}>
                {selectedHotelName || t('booking.selectHotel')}
              </Text>
              {errors.hotel && <Text style={styles.errorText}>{errors.hotel}</Text>}
            </TouchableOpacity>

            {roomTypes.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>{t('booking.roomType')}</Text>
                <View style={styles.roomRow}>
                  {roomTypes.map(rt => (
                    <TouchableOpacity
                      key={rt.name}
                      style={[styles.roomPill, selectedRoomType === rt.name && styles.typePillActive]}
                      onPress={() => {
                        setSelectedRoomType(rt.name)
                        setErrors(prev => ({ ...prev, roomType: '' }))
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.roomText, selectedRoomType === rt.name && styles.typeTextActive]}>{rt.name}</Text>
                      <Text style={[styles.roomPrice, selectedRoomType === rt.name && styles.typeTextActive]}>
                        PKR {rt.pricePerNight.toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.roomType && <Text style={styles.errorText}>{errors.roomType}</Text>}
              </>
            )}

            <Text style={styles.sectionTitle}>{t('booking.rooms')}</Text>
            <View style={styles.counterRow}>
              <Text style={styles.counterLabel}>{t('booking.rooms')}</Text>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  style={[styles.counterBtn, roomsCount <= 1 && styles.counterDisabled]}
                  onPress={() => setRoomsCount(Math.max(1, roomsCount - 1))}
                  disabled={roomsCount <= 1}
                  activeOpacity={0.7}
                >
                  <Text style={styles.counterBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{roomsCount}</Text>
                <TouchableOpacity style={styles.counterBtn} onPress={() => setRoomsCount(roomsCount + 1)} activeOpacity={0.7}>
                  <Text style={styles.counterBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>{t('booking.startDate')}</Text>
        <TouchableOpacity style={styles.dateBtn} onPress={openStartPicker} activeOpacity={0.7}>
          <Text style={styles.dateText}>{formatDate(startDate)}</Text>
        </TouchableOpacity>

        {bookingType === 'hotel' && (
          <>
            <Text style={styles.sectionTitle}>{t('booking.endDate')}</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={openEndPicker} activeOpacity={0.7}>
              <Text style={styles.dateText}>{formatDate(endDate)}</Text>
            </TouchableOpacity>
          </>
        )}

        {Platform.OS === 'ios' && (
          <>
            <DatePickerModal
              visible={showStartPicker}
              title={t('booking.startDate')}
              selectedDate={formatDate(draftStartDate)}
              date={draftStartDate}
              minimumDate={new Date()}
              onChange={onStartChange}
              onCancel={() => setShowStartPicker(false)}
              onConfirm={() => {
                applyStartDate(draftStartDate)
                setShowStartPicker(false)
              }}
              cancelLabel={t('common.cancel')}
              confirmLabel={t('common.ok')}
              theme={theme}
              styles={styles}
            />
            <DatePickerModal
              visible={showEndPicker}
              title={t('booking.endDate')}
              selectedDate={formatDate(draftEndDate)}
              date={draftEndDate}
              minimumDate={new Date(startDate.getTime() + 86400000)}
              onChange={onEndChange}
              onCancel={() => setShowEndPicker(false)}
              onConfirm={() => {
                setEndDate(draftEndDate)
                setShowEndPicker(false)
              }}
              cancelLabel={t('common.cancel')}
              confirmLabel={t('common.ok')}
              theme={theme}
              styles={styles}
            />
          </>
        )}

        <Text style={styles.sectionTitle}>{t('booking.guestCount')}</Text>
        {renderCounter(t('booking.adults'), guests.adults, 'adults')}
        {renderCounter(t('booking.children'), guests.children || 0, 'children')}
        {renderCounter(t('booking.infants'), guests.infants || 0, 'infants')}

        <InputField
          label={t('booking.pickupLocation')}
          placeholder={t('booking.pickupPlaceholder')}
          value={pickupLocation}
          onChangeText={value => {
            setPickupLocation(value)
            if (value.trim()) setErrors(prev => ({ ...prev, pickupLocation: '' }))
          }}
          error={errors.pickupLocation}
        />

        <AppButton title={t('booking.continue')} onPress={handleContinue} containerStyle={styles.continueBtn} />
      </ScrollView>

    </View>
   </SafeAreaView>

      <AppBottomSheet
        ref={sheetRef}
        title={sheetType === 'tour' ? t('booking.selectTour') : t('booking.selectHotel')}
        snapPoints={['60%', '90%']}
      >
        {listLoading ? (
          <View style={styles.sheetLoading}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : sheetType === 'tour' ? (
          tours.map(tour => (
            <TouchableOpacity key={tour._id} style={styles.listItem} onPress={() => selectTour(tour)} activeOpacity={0.7}>
              <AppImage source={{ uri: tour.coverImage }} style={styles.listImage} />
              <View style={styles.listInfo}>
                <Text style={styles.listTitle} numberOfLines={1}>{tour.title}</Text>
                <Text style={styles.listSub} numberOfLines={1}>{tour.destination?.name}</Text>
                <Text style={styles.listPrice}>
                  {tour.currency} {(tour.discountPrice || tour.price).toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          hotels.map(hotel => (
            <TouchableOpacity key={hotel._id} style={styles.listItem} onPress={() => selectHotel(hotel)} activeOpacity={0.7}>
              <AppImage source={{ uri: hotel.coverImage }} style={styles.listImage} />
              <View style={styles.listInfo}>
                <Text style={styles.listTitle} numberOfLines={1}>{hotel.name}</Text>
                <Text style={styles.listSub} numberOfLines={1}>{hotel.address}</Text>
                <Text style={styles.listPrice}>
                  {hotel.currency} {hotel.pricePerNight.toLocaleString()} / {t('home.perNight')}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </AppBottomSheet>
   </>
  )
}

const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.mainBg },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: scale(16), paddingBottom: scale(30) },

    sectionTitle: { fontSize: scale(14), fontWeight: '600', color: theme.heading, marginTop: scale(18), marginBottom: scale(8) },

    typeRow: { flexDirection: 'row', gap: scale(10) },
    typePill: {
      flex: 1,
      paddingVertical: scale(10),
      borderRadius: scale(10),
      backgroundColor: theme.inputBg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    typePillActive: { backgroundColor: theme.primary, borderColor: theme.primary },
    typeText: { fontSize: scale(13), fontWeight: '600', color: theme.subText },
    typeTextActive: { color: theme.buttonText },

    selectedItem: {
      marginTop: scale(12),
      backgroundColor: theme.inputBg,
      borderRadius: scale(10),
      padding: scale(12),
      borderWidth: 1,
      borderColor: theme.border,
    },
    selectedLabel: { fontSize: scale(11), color: theme.subText },
    selectedValue: { fontSize: scale(14), fontWeight: '600', color: theme.text, marginTop: scale(4) },

    roomRow: { gap: scale(8) },
    roomPill: {
      paddingVertical: scale(10),
      paddingHorizontal: scale(14),
      borderRadius: scale(10),
      backgroundColor: theme.inputBg,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    roomText: { fontSize: scale(12), fontWeight: '600', color: theme.text },
    roomPrice: { fontSize: scale(11), color: theme.subText },

    dateBtn: {
      backgroundColor: theme.inputBg,
      borderRadius: scale(10),
      paddingVertical: scale(12),
      paddingHorizontal: scale(14),
      borderWidth: 1,
      borderColor: theme.border,
      minHeight: scale(46),
      justifyContent: 'center',
    },
    dateText: { fontSize: scale(13), fontWeight: '500', color: theme.text },
    dateModalOverlay: {
      flex: 1,
      backgroundColor: theme.modalBg,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: scale(16),
    },
    dateModalCard: {
      width: '100%',
      maxWidth: scale(420),
      paddingHorizontal: scale(18),
      paddingTop: scale(20),
      paddingBottom: scale(16),
      borderRadius: scale(20),
      backgroundColor: theme.secondBg,
      alignItems: 'center',
    },
    dateModalTitle: { alignSelf: 'flex-start', color: theme.heading, fontSize: scale(17), fontWeight: '700' },
    dateModalSelected: {
      color: theme.primary,
      fontSize: scale(14),
      fontWeight: '700',
      backgroundColor: theme.primaryLight,
      overflow: 'hidden',
      borderRadius: scale(9),
      paddingHorizontal: scale(12),
      paddingVertical: scale(7),
      marginTop: scale(12),
      alignSelf: 'flex-start',
    },
    datePicker: { width: '100%', height: scale(190), marginTop: scale(5) },
    dateModalActions: { flexDirection: 'row', width: '100%', gap: scale(10), marginTop: scale(8) },
    dateCancelButton: {
      flex: 1,
      minHeight: scale(46),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: scale(11),
      backgroundColor: theme.inputBg,
    },
    dateCancelText: { color: theme.text, fontSize: scale(13), fontWeight: '600' },
    dateConfirmButton: {
      flex: 1,
      minHeight: scale(46),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: scale(11),
      backgroundColor: theme.primary,
    },
    dateConfirmText: { color: theme.buttonText, fontSize: scale(13), fontWeight: '700' },

    counterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: scale(8) },
    counterLabel: { fontSize: scale(13), fontWeight: '500', color: theme.text },
    counterControls: { flexDirection: 'row', alignItems: 'center', gap: scale(14) },
    counterBtn: {
      width: scale(30),
      height: scale(30),
      borderRadius: scale(8),
      backgroundColor: theme.inputBg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    counterDisabled: { opacity: 0.35 },
    counterBtnText: { fontSize: scale(16), fontWeight: '700', color: theme.text },
    counterValue: { fontSize: scale(15), fontWeight: '600', color: theme.text, minWidth: scale(24), textAlign: 'center' },

    continueBtn: { marginTop: scale(24) },
    errorText: { fontSize: scale(11), color: theme.error, marginTop: scale(4) },

    sheetLoading: { paddingVertical: scale(40), alignItems: 'center' },
    listItem: {
      flexDirection: 'row',
      backgroundColor: theme.cardBg,
      borderRadius: scale(10),
      overflow: 'hidden',
      marginBottom: scale(10),
      borderWidth: 1,
      borderColor: theme.border,
    },
    listImage: { width: scale(70), height: scale(70) },
    listInfo: { flex: 1, padding: scale(10), justifyContent: 'center' },
    listTitle: { fontSize: scale(13), fontWeight: '600', color: theme.text },
    listSub: { fontSize: scale(10), color: theme.subText, marginTop: scale(2) },
    listPrice: { fontSize: scale(11), fontWeight: '700', color: theme.primary, marginTop: scale(3) },
  })
