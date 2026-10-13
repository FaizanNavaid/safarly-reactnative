import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ErrorModel, LoginPayload } from '../../services/interface/interface';
import { useTheme } from '../../services/style/theme/useTheme';
import { ThemeColors } from '../../services/style/color/color';
import { getDeviceInfo, scale, storeData } from '../../services/helper/helper';
import { validate, loginSchema } from '../../services/helper/validation';
import { saveToken } from '../../services/helper/keychainHelper';
import { store } from '../../config/redux/store/Store';
import { setToken, setUser } from '../../config/redux/slice/userSlice';
import { ApiService } from '../../services/api/ApiService';
import { END_POINT } from '../../services/api/endPoint';
import { getApiErrorMessage } from '../../services/api/ApiError';
import { SCREEN } from '../../services/screen-names/ScreenName';
import AppKeyboard from '../../services/app-keyboard-controller/AppKeyBoardController';
import InputField from '../../components/input-field';
import AppButton from '../../components/buttons/app-button';
import { showError } from '../../components/toast/AppToast';

type LoginForm = Omit<LoginPayload, 'machineDetail'>

export default function Login() {
  const [model, setModel] = useState<LoginForm>({
    email: __DEV__ ? 'faizanansari998800@gmail.com' : '',
    password: __DEV__ ? 'Faizan100@' : '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorModel>({});

  const { t } = useTranslation();
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();

  const update = (key: keyof LoginForm, value: string) => {
    setModel(prev => ({ ...prev, [key]: value }));
    if (error[key]) {
      setError(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const fetchProfile = async (accessToken: string) => {
    try {
      const res = await ApiService.getFromAPI<any>(
        END_POINT.auth.profile,
        accessToken,
      );
      if (res?.success) {
        const data: any = res.data;
        const profile = data?.profile ?? data?.user ?? data;
        const fn = profile?.firstName || '';
        const ln = profile?.lastName || '';
        store.dispatch(
          setUser({
            firstName: fn,
            lastName: ln,
            name: `${fn} ${ln}`.trim() || null,
            email: profile?.email ?? null,
            phone: profile?.phone ?? null,
            avatar: profile?.profilePicture ?? null,
            isVerified: profile?.isVerified ?? null,
            createdAt: profile?.createdAt ?? null,
            profileLoaded: true,
          }),
        );
      }
    } catch {}
  };

  const loginUser = async () => {
    const result = validate(loginSchema(), model);
    if (!result.success) {
      setError(result.errors);
      return;
    }
    try {
      setIsLoading(true);
      const machineDetail = await getDeviceInfo();
      const payload: LoginPayload = { ...model, machineDetail };

      const response = await ApiService.postFromAPI(
        END_POINT.auth.login,
        payload,
        '',
      );

      if (response?.success) {
        const data = response?.data;
        const user = data?.user;

        if (user?.isVerified === false) {
          storeData('email', user.email || model.email);
          navigation.navigate(SCREEN.otp, {
            otpData: { email: user.email || model.email, flowType: 'login' },
          });
          return;
        }

        if (data?.accessToken) {
          await saveToken(data.accessToken, data.refreshToken);
          store.dispatch(setToken(data.accessToken));
        }
        const firstName = user?.firstName || '';
        const lastName = user?.lastName || '';
        store.dispatch(
          setUser({
            email: user?.email || model.email,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`.trim() || null,
            phone: user?.phone || null,
            avatar: user?.profilePicture || null,
            isVerified: user?.isVerified ?? null,
            createdAt: user?.createdAt ?? null,
            profileLoaded: true,
          }),
        );
        storeData('email', user?.email || model.email);

        fetchProfile(data.accessToken);
      }
    } catch (err: any) {
      showError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppKeyboard>
        <View style={styles.container}>
          <Text style={styles.heading}>{t('login.title')}</Text>
          <Text style={styles.subtitle}>{t('login.subtitle')}</Text>

          <InputField
            value={model.email}
            label={t('login.email')}
            placeholder={t('login.email')}
            onChangeText={v => update('email', v)}
            error={error.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <InputField
            value={model.password}
            label={t('login.password')}
            placeholder={t('login.password')}
            onChangeText={v => update('password', v)}
            error={error.password}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.forgotRow}
            onPress={() => navigation.navigate(SCREEN.forgotPassword)}
          >
            <Text style={styles.forgotText}>{t('login.forgotPassword')}</Text>
          </TouchableOpacity>

          <AppButton
            title={t('login.title')}
            onPress={loginUser}
            loading={isLoading}
            disabled={isLoading}
            containerStyle={styles.btn}
          />

          <TouchableOpacity
            style={styles.signupRow}
            onPress={() => navigation.navigate(SCREEN.signup)}
          >
            <Text style={styles.signupText}>{t('login.noAccount')} </Text>
            <Text style={styles.signupLink}>{t('login.signUpHere')}</Text>
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
      paddingTop: scale(60),
    },
    heading: {
      fontSize: scale(28),
      fontWeight: '700',
      color: theme.text,
    },
    subtitle: {
      fontSize: scale(14),
      color: theme.subText,
      marginTop: scale(6),
      marginBottom: scale(30),
    },
    forgotRow: {
      alignSelf: 'flex-end',
      marginBottom: scale(20),
    },
    forgotText: {
      fontSize: scale(13),
      color: theme.primary,
      fontWeight: '500',
    },
    btn: {
      marginTop: scale(4),
    },
    signupRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: scale(24),
    },
    signupText: {
      fontSize: scale(14),
      color: theme.subText,
    },
    signupLink: {
      fontSize: scale(14),
      color: theme.primary,
      fontWeight: '600',
    },
  });
