import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../../services/style/theme/useTheme';
import { ThemeColors } from '../../../services/style/color/color';
import { scale } from '../../../services/helper/helper';
import { useAppSelector } from '../../../config/redux/store/Store';
import { ApiService } from '../../../services/api/ApiService';
import { END_POINT } from '../../../services/api/endPoint';
import {
  BookingType,
  CreateBookingPayload,
  Gender,
  Guests,
  PaymentMethod,
} from '../../../services/interface/interface';
import InputField from '../../../components/input-field';
import AppButton from '../../../components/buttons/app-button';
import CustomHeader from '../../../components/custom-header';
import { showSuccess, showError } from '../../../components/toast/AppToast';
import { ApiError } from '../../../services/api/HttpHelper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppStatusBar from '../../../components/status-bar/AppStatusBar';

type RouteParams = {
  BookingStepTwo: {
    bookingType: BookingType;
    tourId?: string;
    hotelId?: string;
    startDate: string;
    endDate: string;
    guests: Guests;
    pickupLocation?: string;
    roomTypeName?: string;
    roomsCount?: number;
  };
};

const GENDERS: Gender[] = ['male', 'female', 'other'];
const PAYMENT_METHODS: PaymentMethod[] = [
  'cash',
  'bank-transfer',
  'jazzcash',
  'easypaisa',
  'card',
];

export default function BookingStepTwo() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<RouteProp<RouteParams, 'BookingStepTwo'>>();
  const token = useAppSelector(state => state.user.token);
  const userEmail = useAppSelector(state => state.user.email);
  const userPhone = useAppSelector(state => state.user.phone);

  const params = route.params;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(userEmail || '');
  const [phone, setPhone] = useState(userPhone || '');
  const [cnic, setCnic] = useState('');
  const [dob, setDob] = useState(new Date(2000, 0, 1));
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [gender, setGender] = useState<Gender>('male');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  const [emName, setEmName] = useState('');
  const [emRelation, setEmRelation] = useState('');
  const [emPhone, setEmPhone] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [specialRequests, setSpecialRequests] = useState('');
  const [dietaryReqs, setDietaryReqs] = useState('');
  const [medicalConds, setMedicalConds] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, setter: (value: string) => void) => (value: string) => {
    setter(value);
    if (value.trim()) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate(),
    ).padStart(2, '0')}`;

  const onDobChange = (_: DateTimePickerEvent, date?: Date) => {
    setShowDobPicker(Platform.OS === 'ios');
    if (date) setDob(date);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    const required = t('booking.required');
    if (!firstName.trim()) e.firstName = required;
    if (!lastName.trim()) e.lastName = required;
    if (!email.trim()) e.email = required;
    if (!phone.trim()) e.phone = required;
    if (!cnic.trim()) e.cnic = required;
    if (!address.trim()) e.address = required;
    if (!city.trim()) e.city = required;
    if (!emName.trim()) e.emName = required;
    if (!emRelation.trim()) e.emRelation = required;
    if (!emPhone.trim()) e.emPhone = required;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const base = {
      startDate: params.startDate,
      guests: params.guests,
      leadTraveler: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        cnic: cnic.trim(),
        dateOfBirth: dob.toISOString(),
        gender,
        address: address.trim(),
        city: city.trim(),
      },
      emergencyContact: {
        name: emName.trim(),
        relation: emRelation.trim(),
        phone: emPhone.trim(),
      },
      paymentMethod,
      ...(params.pickupLocation
        ? { pickupLocation: params.pickupLocation }
        : {}),
      ...(specialRequests.trim()
        ? { specialRequests: specialRequests.trim() }
        : {}),
      ...(dietaryReqs.trim()
        ? { dietaryRequirements: dietaryReqs.trim() }
        : {}),
      ...(medicalConds.trim()
        ? { medicalConditions: medicalConds.trim() }
        : {}),
    };

    let payload: CreateBookingPayload;
    if (params.bookingType === 'tour') {
      payload = { ...base, bookingType: 'tour', tourPackage: params.tourId! };
    } else {
      payload = {
        ...base,
        bookingType: 'hotel',
        hotel: params.hotelId!,
        roomTypeName: params.roomTypeName!,
        roomsCount: params.roomsCount || 1,
        endDate: params.endDate,
      };
    }

    try {
      setLoading(true);
      const res = await ApiService.postFromAPI(
        END_POINT.bookings.create,
        payload,
        token,
      );

      if (res?.success) {
        showSuccess(t('booking.bookingSuccess'));
        navigation.popToTop();
      } else {
        const msg = res?.message || t('booking.bookingError');
        showError(msg);
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr?.data?.errors && Array.isArray(apiErr.data.errors)) {
        const fieldErrors: Record<string, string> = {};
        apiErr.data.errors.forEach((e: { field: string; message: string }) => {
          fieldErrors[e.field] = e.message;
        });
        setErrors(prev => ({ ...prev, ...fieldErrors }));
        showError(apiErr.message || t('booking.bookingError'));
      } else {
        showError(apiErr?.message || t('booking.bookingError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const paymentLabel = (m: PaymentMethod) => {
    const map: Record<PaymentMethod, string> = {
      cash: t('booking.cash'),
      'bank-transfer': t('booking.bankTransfer'),
      jazzcash: t('booking.jazzcash'),
      easypaisa: t('booking.easypaisa'),
      card: t('booking.card'),
    };
    return map[m];
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppStatusBar />
      <CustomHeader title={t('booking.stepTwoTitle')} />

      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>{t('booking.traveler')}</Text>

        <View style={styles.row}>
          <View style={styles.half}>
            <InputField
              label={t('booking.firstName')}
              placeholder="e.g. Ahmed"
              value={firstName}
              onChangeText={updateField('firstName', setFirstName)}
              error={errors.firstName}
            />
          </View>
          <View style={styles.half}>
            <InputField
              label={t('booking.lastName')}
              placeholder="e.g. Khan"
              value={lastName}
              onChangeText={updateField('lastName', setLastName)}
              error={errors.lastName}
            />
          </View>
        </View>

        <InputField
          label={t('booking.email')}
          placeholder="e.g. ahmed@email.com"
          value={email}
          onChangeText={updateField('email', setEmail)}
          keyboardType="email-address"
          error={errors.email}
        />
        <InputField
          label={t('booking.phone')}
          placeholder="e.g. 03001234567"
          value={phone}
          onChangeText={updateField('phone', setPhone)}
          keyboardType="phone-pad"
          error={errors.phone}
        />
        <InputField
          label={t('booking.cnic')}
          placeholder="35202-1234567-1"
          value={cnic}
          onChangeText={updateField('cnic', setCnic)}
          keyboardType="number-pad"
          error={errors.cnic}
        />
        <Text style={styles.fieldLabel}>{t('booking.dateOfBirth')}</Text>
        <TouchableOpacity
          style={styles.dateBtn}
          onPress={() => setShowDobPicker(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.dateText}>{formatDate(dob)}</Text>
        </TouchableOpacity>
        {showDobPicker && (
          <DateTimePicker
            value={dob}
            mode="date"
            maximumDate={new Date()}
            onChange={onDobChange}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          />
        )}

        <Text style={styles.fieldLabel}>{t('booking.gender')}</Text>
        <View style={styles.genderRow}>
          {GENDERS.map(g => (
            <TouchableOpacity
              key={g}
              style={[styles.genderPill, gender === g && styles.genderActive]}
              onPress={() => setGender(g)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === g && styles.genderTextActive,
                ]}
              >
                {t(`booking.${g}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <InputField
          label={t('booking.address')}
          placeholder="e.g. House 12, Street 5"
          value={address}
          onChangeText={updateField('address', setAddress)}
          error={errors.address}
        />
        <InputField
          label={t('booking.city')}
          placeholder="e.g. Islamabad"
          value={city}
          onChangeText={updateField('city', setCity)}
          error={errors.city}
        />

        <Text style={styles.sectionTitle}>{t('booking.emergencyContact')}</Text>
        <InputField
          label={t('booking.emergencyName')}
          placeholder="e.g. Ali Khan"
          value={emName}
          onChangeText={updateField('emName', setEmName)}
          error={errors.emName}
        />
        <InputField
          label={t('booking.emergencyRelation')}
          placeholder="e.g. Brother"
          value={emRelation}
          onChangeText={updateField('emRelation', setEmRelation)}
          error={errors.emRelation}
        />
        <InputField
          label={t('booking.emergencyPhone')}
          placeholder="e.g. 03009876543"
          value={emPhone}
          onChangeText={updateField('emPhone', setEmPhone)}
          keyboardType="phone-pad"
          error={errors.emPhone}
        />

        <Text style={styles.sectionTitle}>{t('booking.paymentMethod')}</Text>
        <View style={styles.paymentRow}>
          {PAYMENT_METHODS.map(m => (
            <TouchableOpacity
              key={m}
              style={[
                styles.paymentPill,
                paymentMethod === m && styles.paymentActive,
              ]}
              onPress={() => setPaymentMethod(m)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.paymentText,
                  paymentMethod === m && styles.paymentTextActive,
                ]}
              >
                {paymentLabel(m)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('booking.optional')}</Text>
        <InputField
          label={t('booking.specialRequests')}
          placeholder="e.g. Window seat, extra blanket"
          value={specialRequests}
          onChangeText={setSpecialRequests}
          multiline
        />
        <InputField
          label={t('booking.dietaryRequirements')}
          placeholder="e.g. Vegetarian, Halal only"
          value={dietaryReqs}
          onChangeText={setDietaryReqs}
        />
        <InputField
          label={t('booking.medicalConditions')}
          placeholder="e.g. Asthma, Allergy"
          value={medicalConds}
          onChangeText={setMedicalConds}
        />

        <AppButton
          title={t('booking.submitBooking')}
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          containerStyle={styles.submitBtn}
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.mainBg },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: scale(16), paddingBottom: scale(30) },

    sectionTitle: {
      fontSize: scale(15),
      fontWeight: '700',
      color: theme.heading,
      marginTop: scale(20),
      marginBottom: scale(10),
    },
    fieldLabel: {
      fontSize: scale(14),
      color: theme.text,
      marginBottom: scale(6),
    },

    dateBtn: {
      backgroundColor: theme.inputBg,
      borderRadius: scale(10),
      paddingVertical: scale(12),
      paddingHorizontal: scale(14),
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: scale(12),
    },
    dateText: { fontSize: scale(13), fontWeight: '500', color: theme.text },

    row: { flexDirection: 'row', gap: scale(10) },
    half: { flex: 1 },

    genderRow: { flexDirection: 'row', gap: scale(8), marginBottom: scale(12) },
    genderPill: {
      flex: 1,
      paddingVertical: scale(9),
      borderRadius: scale(10),
      backgroundColor: theme.inputBg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    genderActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    genderText: {
      fontSize: scale(12),
      fontWeight: '600',
      color: theme.subText,
    },
    genderTextActive: { color: theme.buttonText },

    paymentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: scale(8) },
    paymentPill: {
      paddingVertical: scale(8),
      paddingHorizontal: scale(14),
      borderRadius: scale(8),
      backgroundColor: theme.inputBg,
      borderWidth: 1,
      borderColor: theme.border,
    },
    paymentActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    paymentText: {
      fontSize: scale(11),
      fontWeight: '600',
      color: theme.subText,
    },
    paymentTextActive: { color: theme.buttonText },

    submitBtn: { marginTop: scale(24) },
  });
