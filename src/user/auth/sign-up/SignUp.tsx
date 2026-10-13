import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ErrorModel, SignUpPayload } from '../../services/interface/interface';
import { useTheme } from '../../services/style/theme/useTheme';
import { ThemeColors } from '../../services/style/color/color';
import { getDeviceInfo, scale, storeData } from '../../services/helper/helper';
import { validate, signUpSchema } from '../../services/helper/validation';
import { saveToken } from '../../services/helper/keychainHelper';
import { ApiService } from '../../services/api/ApiService';
import { END_POINT } from '../../services/api/endPoint';
import { getApiErrorMessage } from '../../services/api/ApiError';
import { SCREEN } from '../../services/screen-names/ScreenName';
import AppKeyboard from '../../services/app-keyboard-controller/AppKeyBoardController';
import InputField from '../../components/input-field';
import AppButton from '../../components/buttons/app-button';
import { showError } from '../../components/toast/AppToast';
import { OfferIcon, ShowIcon } from '../../assets/icons';

export default function SignUp() {
  const [model, setModel] = useState<SignUpPayload>({
    firstName: __DEV__ ? 'Faizan' : '',
    lastName: __DEV__ ? 'Navaid' : '',
    email: __DEV__ ? 'faizanansari998800@gmail.com' : '',
    phone: __DEV__ ? '03278433510' : '',
    password: __DEV__ ? 'Faizan100@' : '',
    confirmPassword: __DEV__ ? 'Faizan100@' : '',
    machineDetail: {},
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorModel>({});
  const [showPassword, setShowPassword] = useState(false);

  const { t } = useTranslation();
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();

  const validateForm = () => validate(signUpSchema(), model);

  const update = (key: keyof SignUpPayload, value: string) => {
    setModel(prev => ({ ...prev, [key]: value }));
    if (error[key]) {
      setError(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const createAccount = async () => {
    const result = validateForm();
    if (!result.success) {
      setError(result.errors);
      return;
    }
    try {
      setIsLoading(true);
      let deviceInfo = {};
      try {
        deviceInfo = await getDeviceInfo();
      } catch {}
      const { confirmPassword, ...rest } = model;
      const payload = { ...rest, machineDetail: deviceInfo };
      const response = await ApiService.postFromAPI(
        END_POINT.auth.signup,
        payload,
        '',
      );
console.log(response);

      if (response?.status === 201 || response?.success) {
        const email = response?.data?.email || model.email;
        const otpData = { email, flowType: 'signup' };
        storeData('email', email);
        if (response?.data?.token) {
          await saveToken(response.data.token, response.data.refreshToken);
        }
        navigation.navigate(SCREEN.otp, { otpData });
      }
    } catch (err: any) {
      console.log(err);

      showError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppKeyboard>
        <View style={styles.container}>
          <Text style={styles.heading}>{t('signUp.title')}</Text>

          <InputField
            value={model.firstName}
            label={t('signUp.firstName')}
            placeholder={t('signUp.firstName')}
            onChangeText={v => update('firstName', v)}
            error={error.firstName}
          />

          <InputField
            value={model.lastName}
            label={t('signUp.lastName')}
            placeholder={t('signUp.lastName')}
            onChangeText={v => update('lastName', v)}
            error={error.lastName}
          />

          <InputField
            value={model.email}
            label={t('signUp.email')}
            placeholder={t('signUp.email')}
            onChangeText={v => update('email', v)}
            error={error.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <InputField
            value={model.phone}
            label={t('signUp.phone')}
            placeholder={t('signUp.phone')}
            onChangeText={v => update('phone', v)}
            error={error.phone}
            keyboardType="phone-pad"
          />

          <InputField
            value={model.password}
            label={t('signUp.password')}
            placeholder={t('signUp.password')}
            onChangeText={v => update('password', v)}
            error={error.password}
            secureTextEntry={!showPassword}
            rightIcon={
              showPassword ? (
                <ShowIcon height={scale(20)} width={scale(20)} color={theme.black} />
              ) : (
                <OfferIcon height={scale(20)} width={scale(20)} color={theme.black}/>
              )
            }
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <InputField
            value={model.confirmPassword}
            label={t('signUp.confirmPassword')}
            placeholder={t('signUp.confirmPassword')}
            onChangeText={v => update('confirmPassword', v)}
            error={error.confirmPassword}
            secureTextEntry
          />

          <AppButton
            title={t('signUp.title')}
            onPress={createAccount}
            loading={isLoading}
            disabled={isLoading}
            containerStyle={styles.button}
          />

          <TouchableOpacity
            style={styles.loginRow}
            onPress={() => navigation.navigate(SCREEN.login)}
          >
            <Text style={styles.loginText}>
              {t('signUp.alreadyHaveAccount')}{' '}
            </Text>
            <Text style={styles.loginLink}>{t('signUp.loginHere')}</Text>
          </TouchableOpacity>
        </View>
      </AppKeyboard>
    </SafeAreaView>
  );
}

const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.mainBg,
    },
    container: {
      flex: 1,
      paddingHorizontal: scale(20),
      paddingTop: scale(20),
    },
    heading: {
      fontSize: scale(24),
      fontWeight: '700',
      color: theme.text,
      marginBottom: scale(24),
    },
    button: {
      marginTop: scale(8),
    },
    loginRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: scale(20),
      marginBottom: scale(30),
    },
    loginText: {
      fontSize: scale(14),
      color: theme.subText,
    },
    loginLink: {
      fontSize: scale(14),
      color: theme.primary,
      fontWeight: '600',
    },
  });
