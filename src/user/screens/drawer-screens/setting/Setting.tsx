import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigation, NavigationProp } from '@react-navigation/native';

import { useTheme } from '../../../services/style/theme/useTheme';
import { ThemeColors } from '../../../services/style/color/color';
import { scale } from '../../../services/helper/helper';
import { AppDispatch, useAppSelector } from '../../../config/redux/store/Store';
import { toggleTheme } from '../../../config/redux/slice/themeSlice';
import { toggleLanguage } from '../../../config/redux/slice/languageSlice';
import { SCREEN } from '../../../services/screen-names/ScreenName';
import { ProfileIcon, SettingIcon } from '../../../assets/icons';
import CustomHeader from '../../../components/custom-header';
import AppStatusBar from '../../../components/status-bar/AppStatusBar';

type SettingRowProps = {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  last?: boolean;
  styles: ReturnType<typeof getStyles>;
};

function SettingRow({
  icon,
  label,
  value,
  onPress,
  last,
  styles,
}: SettingRowProps) {
  const content = (
    <>
      <View style={styles.rowIcon}>{icon}</View>
      <Text style={styles.rowLabel}>{label}</Text>
      {value ? (
        <Text style={styles.rowValue} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {onPress ? <Text style={styles.chevron}>›</Text> : null}
    </>
  );

  return onPress ? (
    <TouchableOpacity
      style={[styles.row, !last && styles.rowDivider]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {content}
    </TouchableOpacity>
  ) : (
    <View style={[styles.row, !last && styles.rowDivider]}>{content}</View>
  );
}

export default function Setting() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = getStyles(theme);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp<any>>();
  const { mode } = useAppSelector(state => state.theme);
  const { lang } = useAppSelector(state => state.language);
  const { name, email } = useAppSelector(state => state.user);
  const isDark = mode === 'dark';
  const isUrdu = lang === 'ur';

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppStatusBar />
      <CustomHeader title={t('common.settings')} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.group}>
          <SettingRow
            styles={styles}
            icon={<Text style={styles.rowGlyph}>@</Text>}
            label={t('settings.email')}
            value={email || t('settings.notSet')}
          />
          <SettingRow
            styles={styles}
            icon={
              <ProfileIcon
                width={scale(19)}
                height={scale(19)}
                color={theme.subText}
              />
            }
            label={t('settings.username')}
            value={name || t('settings.notSet')}
            last
          />
        </View>

        <View style={styles.group}>
          <SettingRow
            styles={styles}
            icon={
              <SettingIcon
                width={scale(19)}
                height={scale(19)}
                color={theme.subText}
              />
            }
            label={t('settings.theme')}
            value={isDark ? t('settings.dark') : t('settings.light')}
            onPress={() => dispatch(toggleTheme())}
          />
          <SettingRow
            styles={styles}
            icon={
              <Text style={styles.languageIcon}>{isUrdu ? 'اردو' : 'A'}</Text>
            }
            label={t('settings.language')}
            value={isUrdu ? t('common.urdu') : t('common.english')}
            onPress={() => dispatch(toggleLanguage())}
            last
          />
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Text style={styles.statusIconText}>✓</Text>
          </View>
          <View style={styles.statusCopy}>
            <Text style={styles.statusTitle}>{t('settings.savedTitle')}</Text>
            <Text style={styles.statusDescription}>{t('settings.footer')}</Text>
          </View>
        </View>

        <View style={styles.group}>
          <SettingRow
            styles={styles}
            icon={<Text style={styles.rowGlyph}>◇</Text>}
            label={t('settings.privacy')}
            onPress={() => navigation.navigate(SCREEN.privacyPolicy)}
            last
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.mainBg },
    content: {
      paddingHorizontal: scale(12),
      paddingTop: scale(12),
      paddingBottom: scale(32),
    },
    header: {
      alignItems: 'center',
      paddingVertical: scale(18),
      marginBottom: scale(8),
    },
    title: { color: theme.heading, fontSize: scale(21), fontWeight: '700' },
    subtitle: {
      color: theme.subText,
      fontSize: scale(12),
      marginTop: scale(6),
      textAlign: 'center',
    },
    group: {
      backgroundColor: theme.cardBg,
      borderRadius: scale(18),
      paddingHorizontal: scale(16),
      marginBottom: scale(18),
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.07,
      shadowRadius: 8,
      elevation: 2,
    },
    row: { minHeight: scale(54), flexDirection: 'row', alignItems: 'center' },
    rowDivider: { borderBottomWidth: 1, borderBottomColor: theme.divider },
    rowIcon: {
      width: scale(27),
      alignItems: 'flex-start',
      justifyContent: 'center',
      marginRight: scale(8),
    },
    rowGlyph: {
      width: scale(19),
      textAlign: 'center',
      color: theme.subText,
      fontSize: scale(17),
      fontWeight: '500',
    },
    languageIcon: {
      color: theme.subText,
      fontSize: scale(11),
      fontWeight: '700',
    },
    rowLabel: {
      flex: 1,
      color: theme.text,
      fontSize: scale(13),
      fontWeight: '500',
    },
    rowValue: {
      maxWidth: '48%',
      color: theme.subText,
      fontSize: scale(11),
      marginRight: scale(8),
      textAlign: 'right',
    },
    chevron: {
      color: theme.subText,
      fontSize: scale(23),
      lineHeight: scale(26),
      fontWeight: '300',
    },
    statusCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: scale(15),
      borderRadius: scale(16),
      backgroundColor: theme.cardBg,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: scale(18),
    },
    statusIcon: {
      width: scale(30),
      height: scale(30),
      borderRadius: scale(15),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.primaryLight,
      marginRight: scale(11),
    },
    statusIconText: {
      color: theme.primary,
      fontSize: scale(15),
      fontWeight: '800',
    },
    statusCopy: { flex: 1 },
    statusTitle: {
      color: theme.heading,
      fontSize: scale(12),
      fontWeight: '700',
    },
    statusDescription: {
      color: theme.subText,
      fontSize: scale(10),
      lineHeight: scale(15),
      marginTop: scale(4),
    },
  });
