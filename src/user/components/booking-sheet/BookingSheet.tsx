import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  BackHandler,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../../services/style/theme/useTheme';
import { ThemeColors } from '../../services/style/color/color';
import { scale } from '../../services/helper/helper';
import { useAppSelector } from '../../config/redux/store/Store';
import { ApiService } from '../../services/api/ApiService';
import { END_POINT } from '../../services/api/endPoint';
import { showError, showSuccess } from '../toast/AppToast';
import InputField from '../input-field';
import AppButton from '../buttons/app-button';

export type BookingSheetRef = {
  open: () => void;
  close: () => void;
};

type TourConfig = {
  bookingType: 'tour';
  tourId: string;
  tourTitle: string;
};

type HotelConfig = {
  bookingType: 'hotel';
  hotelId: string;
  hotelName: string;
  roomTypes: { name: string; pricePerNight: number }[];
};

type Props = {
  config: TourConfig | HotelConfig;
  onSuccess?: () => void;
};

type Gender = 'male' | 'female' | 'other';
type PaymentMethod =
  | 'cash'
  | 'bank-transfer'
  | 'jazzcash'
  | 'easypaisa'
  | 'card';

const GENDERS: Gender[] = ['male', 'female', 'other'];
const PAYMENT_METHODS: PaymentMethod[] = [
  'cash',
  'bank-transfer',
  'jazzcash',
  'easypaisa',
  'card',
];

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: 'booking.cash',
  'bank-transfer': 'booking.bankTransfer',
  jazzcash: 'booking.jazzcash',
  easypaisa: 'booking.easypaisa',
  card: 'booking.card',
};

const BookingSheet = forwardRef<BookingSheetRef, Props>(
  ({ config, onSuccess }, ref) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const styles = getStyles(theme);
    const token = useAppSelector(state => state.user.token);
    const user = useAppSelector(state => state.user);

    const SheetInput = BottomSheetTextInput;
    const sheetRef = useRef<BottomSheet>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [startDate, setStartDate] = useState(
      new Date(Date.now() + 7 * 86400000),
    );
    const [endDate, setEndDate] = useState(
      new Date(Date.now() + 10 * 86400000),
    );
    const [showDatePicker, setShowDatePicker] = useState<
      'start' | 'end' | null
    >(null);
    const [draftDate, setDraftDate] = useState(new Date());
    const [guests, setGuests] = useState({
      adults: 1,
      children: 0,
      infants: 0,
    });
    const [pickupLocation, setPickupLocation] = useState('');
    const [selectedRoomType, setSelectedRoomType] = useState(
      config.bookingType === 'hotel' ? config.roomTypes[0]?.name || '' : '',
    );
    const [roomsCount, setRoomsCount] = useState(1);

    const [firstName, setFirstName] = useState(user.firstName || '');
    const [lastName, setLastName] = useState(user.lastName || '');
    const [email, setEmail] = useState(user.email || '');
    const [phone, setPhone] = useState(user.phone || '');
    const [cnic, setCnic] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState<Gender>('male');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');

    const [emergencyName, setEmergencyName] = useState('');
    const [emergencyRelation, setEmergencyRelation] = useState('');
    const [emergencyPhone, setEmergencyPhone] = useState('');

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
    const [specialRequests, setSpecialRequests] = useState('');
    const [dietaryRequirements, setDietaryRequirements] = useState('');
    const [medicalConditions, setMedicalConditions] = useState('');

    useImperativeHandle(ref, () => ({
      open: () => {
        setStep(0);
        setErrors({});
        sheetRef.current?.snapToIndex(0);
      },
      close: () => sheetRef.current?.close(),
    }));

    useEffect(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (isOpen) {
          if (step > 0) {
            setStep(step - 1);
            return true;
          }
          sheetRef.current?.close();
          return true;
        }
        return false;
      });
      return () => sub.remove();
    }, [isOpen, step]);

    const handleChange = useCallback((index: number) => {
      setIsOpen(index >= 0);
    }, []);

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
    );

    const formatDate = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate(),
      ).padStart(2, '0')}`;

    const openDatePicker = (type: 'start' | 'end') => {
      const currentDate = type === 'start' ? startDate : endDate;
      const minDate =
        type === 'start'
          ? new Date()
          : new Date(startDate.getTime() + 86400000);

      if (Platform.OS === 'android') {
        DateTimePickerAndroid.open({
          value: currentDate,
          mode: 'date',
          minimumDate: minDate,
          onChange: (event, date) => {
            if (event.type === 'set' && date) {
              if (type === 'start') {
                setStartDate(date);
                if (date >= endDate)
                  setEndDate(new Date(date.getTime() + 86400000));
              } else {
                setEndDate(date);
              }
            }
          },
        });
        return;
      }
      setDraftDate(currentDate);
      setShowDatePicker(type);
    };

    const confirmDate = () => {
      if (showDatePicker === 'start') {
        setStartDate(draftDate);
        if (draftDate >= endDate)
          setEndDate(new Date(draftDate.getTime() + 86400000));
      } else {
        setEndDate(draftDate);
      }
      setShowDatePicker(null);
    };

    const updateGuest = (key: keyof typeof guests, delta: number) => {
      setGuests(prev => {
        const min = key === 'adults' ? 1 : 0;
        return { ...prev, [key]: Math.max(min, (prev[key] || 0) + delta) };
      });
    };

    const clearError = (key: string) => {
      if (errors[key])
        setErrors(prev => {
          const c = { ...prev };
          delete c[key];
          return c;
        });
    };

    const validateStep0 = () => {
      const e: Record<string, string> = {};
      const req = t('booking.required');
      if (!pickupLocation.trim()) e.pickupLocation = req;
      if (config.bookingType === 'hotel' && !selectedRoomType) e.roomType = req;
      setErrors(e);
      return Object.keys(e).length === 0;
    };

    const validateStep1 = () => {
      const e: Record<string, string> = {};
      const req = t('booking.required');
      if (!firstName.trim()) e.firstName = req;
      if (!lastName.trim()) e.lastName = req;
      if (!email.trim()) e.email = req;
      if (!phone.trim()) e.phone = req;
      if (!cnic.trim()) e.cnic = req;
      if (!dob.trim()) e.dob = req;
      if (!address.trim()) e.address = req;
      if (!city.trim()) e.city = req;
      if (!emergencyName.trim()) e.emergencyName = req;
      if (!emergencyRelation.trim()) e.emergencyRelation = req;
      if (!emergencyPhone.trim()) e.emergencyPhone = req;
      setErrors(e);
      return Object.keys(e).length === 0;
    };

    const handleNext = () => {
      if (validateStep0()) setStep(1);
    };

    const handleSubmit = async () => {
      if (!validateStep1()) return;

      const leadTraveler = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        cnic: cnic.trim(),
        dateOfBirth: dob.trim(),
        gender,
        address: address.trim(),
        city: city.trim(),
      };

      const emergencyContact = {
        name: emergencyName.trim(),
        relation: emergencyRelation.trim(),
        phone: emergencyPhone.trim(),
      };

      const base = {
        startDate: formatDate(startDate),
        guests,
        leadTraveler,
        emergencyContact,
        paymentMethod,
        ...(pickupLocation.trim()
          ? { pickupLocation: pickupLocation.trim() }
          : {}),
        ...(specialRequests.trim()
          ? { specialRequests: specialRequests.trim() }
          : {}),
        ...(dietaryRequirements.trim()
          ? { dietaryRequirements: dietaryRequirements.trim() }
          : {}),
        ...(medicalConditions.trim()
          ? { medicalConditions: medicalConditions.trim() }
          : {}),
      };

      const payload =
        config.bookingType === 'tour'
          ? {
              ...base,
              bookingType: 'tour' as const,
              tourPackage: config.tourId,
            }
          : {
              ...base,
              bookingType: 'hotel' as const,
              hotel: config.hotelId,
              endDate: formatDate(endDate),
              roomTypeName: selectedRoomType,
              roomsCount,
            };

      try {
        setLoading(true);
        const res = await ApiService.postFromAPI(
          END_POINT.bookings.create,
          payload,
          token,
        );
        if (res?.success) {
          showSuccess(t('booking.bookingSuccess'));
          sheetRef.current?.close();
          onSuccess?.();
        } else {
          showError(res?.message || t('booking.bookingError'));
        }
      } catch (err: any) {
        console.log(err);

        const msg =
          err?.data?.errors?.[0]?.message ||
          err?.message ||
          t('booking.bookingError');
        showError(msg);
      } finally {
        setLoading(false);
      }
    };

    const renderCounter = (
      label: string,
      value: number,
      key: keyof typeof guests,
    ) => (
      <View style={styles.counterRow}>
        <Text style={styles.counterLabel}>{label}</Text>
        <View style={styles.counterControls}>
          <TouchableOpacity
            style={[
              styles.counterBtn,
              value <= (key === 'adults' ? 1 : 0) && styles.counterDisabled,
            ]}
            onPress={() => updateGuest(key, -1)}
            disabled={value <= (key === 'adults' ? 1 : 0)}
            activeOpacity={0.7}
          >
            <Text style={styles.counterBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.counterValue}>{value}</Text>
          <TouchableOpacity
            style={styles.counterBtn}
            onPress={() => updateGuest(key, 1)}
            activeOpacity={0.7}
          >
            <Text style={styles.counterBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );

    const renderPill = <T extends string>(
      items: T[],
      selected: T,
      onSelect: (v: T) => void,
      labelFn: (v: T) => string,
    ) => (
      <View style={styles.pillRow}>
        {items.map(item => (
          <TouchableOpacity
            key={item}
            style={[styles.pill, selected === item && styles.pillActive]}
            onPress={() => onSelect(item)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.pillText,
                selected === item && styles.pillTextActive,
              ]}
            >
              {labelFn(item)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );

    const renderStep0 = () => (
      <>
        <View style={styles.stepHeader}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>1/2</Text>
          </View>
          <Text style={styles.stepTitle}>{t('booking.stepOneTitle')}</Text>
        </View>

        <Text style={styles.label}>{t('booking.startDate')}</Text>
        <TouchableOpacity
          style={styles.dateBtn}
          onPress={() => openDatePicker('start')}
          activeOpacity={0.7}
        >
          <Text style={styles.dateText}>{formatDate(startDate)}</Text>
        </TouchableOpacity>

        {config.bookingType === 'hotel' && (
          <>
            <Text style={styles.label}>{t('booking.endDate')}</Text>
            <TouchableOpacity
              style={styles.dateBtn}
              onPress={() => openDatePicker('end')}
              activeOpacity={0.7}
            >
              <Text style={styles.dateText}>{formatDate(endDate)}</Text>
            </TouchableOpacity>
          </>
        )}

        {Platform.OS === 'ios' && showDatePicker && (
          <View style={styles.iosPickerWrap}>
            <DateTimePicker
              value={draftDate}
              mode="date"
              minimumDate={
                showDatePicker === 'start'
                  ? new Date()
                  : new Date(startDate.getTime() + 86400000)
              }
              onChange={(_, d) => d && setDraftDate(d)}
              display="spinner"
              textColor={theme.text}
            />
            <View style={styles.iosPickerActions}>
              <TouchableOpacity
                onPress={() => setShowDatePicker(null)}
                style={styles.iosCancelBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.iosCancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDate}
                style={styles.iosConfirmBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.iosConfirmText}>{t('common.ok')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.label}>{t('booking.guestCount')}</Text>
        {renderCounter(t('booking.adults'), guests.adults, 'adults')}
        {renderCounter(t('booking.children'), guests.children, 'children')}
        {renderCounter(t('booking.infants'), guests.infants, 'infants')}

        {config.bookingType === 'hotel' && config.roomTypes.length > 0 && (
          <>
            <Text style={styles.label}>{t('booking.roomType')}</Text>
            {config.roomTypes.map(rt => (
              <TouchableOpacity
                key={rt.name}
                style={[
                  styles.roomOption,
                  selectedRoomType === rt.name && styles.roomOptionActive,
                ]}
                onPress={() => {
                  setSelectedRoomType(rt.name);
                  clearError('roomType');
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.roomName,
                    selectedRoomType === rt.name && styles.pillTextActive,
                  ]}
                >
                  {rt.name}
                </Text>
                <Text
                  style={[
                    styles.roomPrice,
                    selectedRoomType === rt.name && styles.pillTextActive,
                  ]}
                >
                  PKR {rt.pricePerNight.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
            {errors.roomType && (
              <Text style={styles.errorText}>{errors.roomType}</Text>
            )}

            <Text style={styles.label}>{t('booking.rooms')}</Text>
            <View style={styles.counterRow}>
              <Text style={styles.counterLabel}>{t('booking.rooms')}</Text>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  style={[
                    styles.counterBtn,
                    roomsCount <= 1 && styles.counterDisabled,
                  ]}
                  onPress={() => setRoomsCount(Math.max(1, roomsCount - 1))}
                  disabled={roomsCount <= 1}
                  activeOpacity={0.7}
                >
                  <Text style={styles.counterBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{roomsCount}</Text>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setRoomsCount(roomsCount + 1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.counterBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        <InputField
          inputComponent={SheetInput}
          label={t('booking.pickupLocation')}
          placeholder={t('booking.pickupPlaceholder')}
          value={pickupLocation}
          onChangeText={v => {
            setPickupLocation(v);
            clearError('pickupLocation');
          }}
          error={errors.pickupLocation}
        />

        <AppButton
          title={t('booking.continue')}
          onPress={handleNext}
          containerStyle={styles.submitBtn}
        />
      </>
    );

    const renderStep1 = () => (
      <>
        <View style={styles.stepHeader}>
          <TouchableOpacity
            onPress={() => setStep(0)}
            activeOpacity={0.7}
            style={styles.backBtn}
          >
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>2/2</Text>
          </View>
          <Text style={styles.stepTitle}>{t('booking.stepTwoTitle')}</Text>
        </View>

        <Text style={styles.sectionLabel}>{t('booking.traveler')}</Text>

        <InputField
          inputComponent={SheetInput}
          label={t('booking.firstName')}
          placeholder={t('booking.firstName')}
          value={firstName}
          onChangeText={v => {
            setFirstName(v);
            clearError('firstName');
          }}
          error={errors.firstName}
        />
        <InputField
          inputComponent={SheetInput}
          label={t('booking.lastName')}
          placeholder={t('booking.lastName')}
          value={lastName}
          onChangeText={v => {
            setLastName(v);
            clearError('lastName');
          }}
          error={errors.lastName}
        />
        <InputField
          inputComponent={SheetInput}
          label={t('booking.email')}
          placeholder={t('booking.email')}
          value={email}
          onChangeText={v => {
            setEmail(v);
            clearError('email');
          }}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <InputField
          inputComponent={SheetInput}
          label={t('booking.phone')}
          placeholder={t('booking.phone')}
          value={phone}
          onChangeText={v => {
            setPhone(v);
            clearError('phone');
          }}
          error={errors.phone}
          keyboardType="phone-pad"
        />
        <InputField
          inputComponent={SheetInput}
          label={t('booking.cnic')}
          placeholder="35202-1234567-1"
          value={cnic}
          onChangeText={v => {
            setCnic(v);
            clearError('cnic');
          }}
          error={errors.cnic}
          keyboardType="number-pad"
        />
        <InputField
          inputComponent={SheetInput}
          label={t('booking.dateOfBirth')}
          placeholder="1998-04-12"
          value={dob}
          onChangeText={v => {
            setDob(v);
            clearError('dob');
          }}
          error={errors.dob}
        />

        <Text style={styles.label}>{t('booking.gender')}</Text>
        {renderPill(GENDERS, gender, setGender, g => t(`booking.${g}`))}

        <InputField
          inputComponent={SheetInput}
          label={t('booking.address')}
          placeholder={t('booking.address')}
          value={address}
          onChangeText={v => {
            setAddress(v);
            clearError('address');
          }}
          error={errors.address}
        />
        <InputField
          inputComponent={SheetInput}
          label={t('booking.city')}
          placeholder={t('booking.city')}
          value={city}
          onChangeText={v => {
            setCity(v);
            clearError('city');
          }}
          error={errors.city}
        />

        <Text style={styles.sectionLabel}>{t('booking.emergencyContact')}</Text>

        <InputField
          inputComponent={SheetInput}
          label={t('booking.emergencyName')}
          placeholder={t('booking.emergencyName')}
          value={emergencyName}
          onChangeText={v => {
            setEmergencyName(v);
            clearError('emergencyName');
          }}
          error={errors.emergencyName}
        />
        <InputField
          inputComponent={SheetInput}
          label={t('booking.emergencyRelation')}
          placeholder={t('booking.emergencyRelation')}
          value={emergencyRelation}
          onChangeText={v => {
            setEmergencyRelation(v);
            clearError('emergencyRelation');
          }}
          error={errors.emergencyRelation}
        />
        <InputField
          inputComponent={SheetInput}
          label={t('booking.emergencyPhone')}
          placeholder={t('booking.emergencyPhone')}
          value={emergencyPhone}
          onChangeText={v => {
            setEmergencyPhone(v);
            clearError('emergencyPhone');
          }}
          error={errors.emergencyPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.sectionLabel}>{t('booking.paymentMethod')}</Text>
        {renderPill(PAYMENT_METHODS, paymentMethod, setPaymentMethod, p =>
          t(PAYMENT_LABELS[p]),
        )}

        <Text style={styles.sectionLabel}>{`${t('booking.optional')}`}</Text>

        <InputField
          inputComponent={SheetInput}
          label={t('booking.specialRequests')}
          placeholder={t('booking.specialRequests')}
          value={specialRequests}
          onChangeText={setSpecialRequests}
          multiline
        />
        <InputField
          inputComponent={SheetInput}
          label={t('booking.dietaryRequirements')}
          placeholder={t('booking.dietaryRequirements')}
          value={dietaryRequirements}
          onChangeText={setDietaryRequirements}
        />
        <InputField
          inputComponent={SheetInput}
          label={t('booking.medicalConditions')}
          placeholder={t('booking.medicalConditions')}
          value={medicalConditions}
          onChangeText={setMedicalConditions}
        />

        <AppButton
          title={t('booking.submitBooking')}
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          containerStyle={styles.submitBtn}
        />
      </>
    );

    return (
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={['92%']}
        enablePanDownToClose
        onChange={handleChange}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.background}
        handleIndicatorStyle={styles.indicator}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustPan"
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>
            {config.bookingType === 'tour'
              ? (config as TourConfig).tourTitle
              : (config as HotelConfig).hotelName}
          </Text>
        </View>
        <BottomSheetScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 0 ? renderStep0() : renderStep1()}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

export default BookingSheet;

const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    background: {
      backgroundColor: theme.secondBg,
      borderTopLeftRadius: scale(20),
      borderTopRightRadius: scale(20),
    },
    indicator: {
      backgroundColor: theme.placeholder,
      width: scale(36),
      height: scale(4),
    },
    sheetHeader: {
      paddingHorizontal: scale(16),
      paddingBottom: scale(12),
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
    },
    sheetTitle: {
      fontSize: scale(16),
      fontWeight: '700',
      color: theme.heading,
    },
    content: {
      paddingHorizontal: scale(16),
      paddingTop: scale(12),
      paddingBottom: scale(40),
    },
    stepHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: scale(16),
    },
    stepBadge: {
      backgroundColor: theme.primaryLight,
      paddingHorizontal: scale(10),
      paddingVertical: scale(4),
      borderRadius: scale(10),
    },
    stepBadgeText: {
      fontSize: scale(11),
      fontWeight: '700',
      color: theme.primary,
    },
    stepTitle: {
      fontSize: scale(15),
      fontWeight: '700',
      color: theme.heading,
      marginLeft: scale(10),
    },
    backBtn: {
      width: scale(30),
      height: scale(30),
      borderRadius: scale(8),
      backgroundColor: theme.inputBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: scale(8),
    },
    backBtnText: {
      fontSize: scale(20),
      fontWeight: '600',
      color: theme.text,
      marginTop: -scale(2),
    },
    label: {
      fontSize: scale(12),
      fontWeight: '600',
      color: theme.heading,
      marginTop: scale(14),
      marginBottom: scale(6),
    },
    sectionLabel: {
      fontSize: scale(13),
      fontWeight: '700',
      color: theme.primary,
      marginTop: scale(20),
      marginBottom: scale(8),
    },
    dateBtn: {
      backgroundColor: theme.inputBg,
      borderRadius: scale(10),
      paddingVertical: scale(12),
      paddingHorizontal: scale(14),
      borderWidth: 1,
      borderColor: theme.border,
    },
    dateText: {
      fontSize: scale(13),
      fontWeight: '500',
      color: theme.text,
    },
    iosPickerWrap: {
      backgroundColor: theme.cardBg,
      borderRadius: scale(14),
      marginTop: scale(8),
      padding: scale(8),
      borderWidth: 1,
      borderColor: theme.border,
    },
    iosPickerActions: {
      flexDirection: 'row',
      gap: scale(10),
      marginTop: scale(4),
    },
    iosCancelBtn: {
      flex: 1,
      paddingVertical: scale(10),
      alignItems: 'center',
      borderRadius: scale(8),
      backgroundColor: theme.inputBg,
    },
    iosCancelText: {
      fontSize: scale(13),
      fontWeight: '600',
      color: theme.text,
    },
    iosConfirmBtn: {
      flex: 1,
      paddingVertical: scale(10),
      alignItems: 'center',
      borderRadius: scale(8),
      backgroundColor: theme.primary,
    },
    iosConfirmText: {
      fontSize: scale(13),
      fontWeight: '700',
      color: theme.buttonText,
    },
    counterRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: scale(6),
    },
    counterLabel: {
      fontSize: scale(13),
      fontWeight: '500',
      color: theme.text,
    },
    counterControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(14),
    },
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
    counterBtnText: {
      fontSize: scale(16),
      fontWeight: '700',
      color: theme.text,
    },
    counterValue: {
      fontSize: scale(15),
      fontWeight: '600',
      color: theme.text,
      minWidth: scale(24),
      textAlign: 'center',
    },
    pillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: scale(8),
    },
    pill: {
      paddingHorizontal: scale(14),
      paddingVertical: scale(9),
      borderRadius: scale(10),
      backgroundColor: theme.inputBg,
      borderWidth: 1,
      borderColor: theme.border,
    },
    pillActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    pillText: {
      fontSize: scale(12),
      fontWeight: '600',
      color: theme.subText,
    },
    pillTextActive: {
      color: theme.buttonText,
    },
    roomOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: scale(10),
      paddingHorizontal: scale(14),
      borderRadius: scale(10),
      backgroundColor: theme.inputBg,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: scale(8),
    },
    roomOptionActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    roomName: {
      fontSize: scale(12),
      fontWeight: '600',
      color: theme.text,
    },
    roomPrice: {
      fontSize: scale(11),
      color: theme.subText,
    },
    errorText: {
      fontSize: scale(11),
      color: theme.error,
      marginTop: scale(2),
    },
    submitBtn: {
      marginTop: scale(24),
    },
  });
