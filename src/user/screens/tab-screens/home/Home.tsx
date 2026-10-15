import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../../services/style/theme/useTheme';
import { ThemeColors } from '../../../services/style/color/color';
import { scale } from '../../../services/helper/helper';
import { useAppSelector } from '../../../config/redux/store/Store';
import { ApiService } from '../../../services/api/ApiService';
import { END_POINT } from '../../../services/api/endPoint';
import {
  DashboardData,
  Destination,
} from '../../../services/interface/interface';
import {
  NotificationIcon,
  SearchIcon,
  StarIcon,
  LocationIcon,
} from '../../../assets/icons';
import { SCREEN } from '../../../services/screen-names/ScreenName';
import AppImage from '../../../components/app-image';
import CategoryCard from '../../../components/cards/CategoryCard';
import DestinationCard from '../../../components/cards/DestinationCard';
import TourCard from '../../../components/cards/TourCard';
import HotelCard from '../../../components/cards/HotelCard';
import AppStatusBar from '../../../components/status-bar/AppStatusBar';
import InputField from '../../../components/input-field';
import HomeSkeleton from '../../../components/skeleton/HomeSkeleton';

const { width: SCREEN_W } = Dimensions.get('window');
const FEATURED_CARD_W = SCREEN_W - scale(48);
const FEATURED_CARD_H = scale(165);

export default function Home() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { firstName, avatar } = useAppSelector(state => state.user);
  const token = useAppSelector(state => state.user.token);

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [searchName, setSearchName] = useState('');

  const fetchDashboard = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(false);

        const response = await ApiService.getFromAPI<DashboardData>(
          END_POINT.travel.dashboard,
          token,
        );

        if (response?.success && response?.data) {
          setDashboard(response.data);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const onRefresh = useCallback(() => {
    fetchDashboard(true);
  }, [fetchDashboard]);

  const renderSectionHeader = (title: string, onSeeAll?: () => void) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
          <Text style={styles.seeAll}>{t('home.seeAll')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFeaturedItem = ({ item }: { item: Destination }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() =>
        navigation.navigate(SCREEN.destinationDetail, { slug: item.slug })
      }
      activeOpacity={0.85}
    >
      <AppImage
        source={{ uri: item.coverImage }}
        style={styles.featuredImage}
      />
      <View style={styles.featuredOverlay} />
      <View style={styles.featuredContent}>
        <Text style={styles.featuredName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.featuredRow}>
          <LocationIcon
            width={scale(11)}
            height={scale(11)}
            color="rgba(255,255,255,0.9)"
          />
          <Text style={styles.featuredLocation} numberOfLines={1}>
            {item.city}, {item.country}
          </Text>
        </View>
      </View>
      <View style={styles.featuredRating}>
        <StarIcon width={scale(9)} height={scale(9)} color={theme.copper} />
        <Text style={styles.featuredRatingText}>{item.rating}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppStatusBar />
        <HomeSkeleton />
      </SafeAreaView>
    );
  }

  if (error || !dashboard) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppStatusBar />
        <View style={styles.centered}>
          <Text style={styles.errorText}>{t('home.errorLoading')}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchDashboard()}
            activeOpacity={0.7}
          >
            <Text style={styles.retryText}>{t('home.retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.avatarBtn}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          activeOpacity={0.7}
        >
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarInitial}>
              {firstName ? firstName.charAt(0).toUpperCase() : '?'}
            </Text>
          )}
        </TouchableOpacity>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>
            {t('home.greeting')}
            {firstName ? `, ${firstName}` : ''}
          </Text>
          <Text style={styles.subtitle}>{t('splash.tagline')}</Text>
        </View>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => {}}
          activeOpacity={0.7}
        >
          <NotificationIcon
            width={scale(20)}
            height={scale(20)}
            color={theme.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        <InputField
          containerStyle={{ paddingHorizontal: scale(12) }}
          value={searchName}
          onChangeText={e => setSearchName(e)}
          leftIcon={
            <SearchIcon
              width={scale(16)}
              height={scale(16)}
              color={theme.placeholder}
            />
          }
          placeholder={t('home.searchPlaceholder')}
        />

        {dashboard.categories.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader(t('home.categories'))}
            <FlatList
              data={dashboard.categories}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <CategoryCard item={item} onPress={() => {}} />
              )}
            />
          </View>
        )}

        {dashboard.featured.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader(t('home.featured'), () => {})}
            <FlatList
              data={dashboard.featured}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              keyExtractor={item => item._id}
              snapToInterval={FEATURED_CARD_W + scale(12)}
              decelerationRate="fast"
              renderItem={renderFeaturedItem}
            />
          </View>
        )}

        {dashboard.trending.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader(t('home.trending'), () => {})}
            <FlatList
              data={dashboard.trending}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <DestinationCard
                  item={item}
                  onPress={() =>
                    navigation.navigate(SCREEN.destinationDetail, {
                      slug: item.slug,
                    })
                  }
                />
              )}
            />
          </View>
        )}

        {dashboard.popular.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader(t('home.popular'), () => {})}
            <FlatList
              data={dashboard.popular}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <DestinationCard
                  item={item}
                  onPress={() =>
                    navigation.navigate(SCREEN.destinationDetail, {
                      slug: item.slug,
                    })
                  }
                />
              )}
            />
          </View>
        )}

        {dashboard.topTours.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader(t('home.topTours'), () => {})}
            <FlatList
              data={dashboard.topTours}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <TourCard
                  item={item}
                  onPress={() =>
                    navigation.navigate(SCREEN.tourDetail, { slug: item.slug })
                  }
                />
              )}
            />
          </View>
        )}

        {dashboard.topHotels.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader(t('home.topHotels'), () => {})}
            <FlatList
              data={dashboard.topHotels}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <HotelCard
                  item={item}
                  onPress={() =>
                    navigation.navigate(SCREEN.hotelDetail, { slug: item.slug })
                  }
                />
              )}
            />
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.mainBg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: scale(16),
      paddingTop: scale(6),
      paddingBottom: scale(8),
    },
    avatarBtn: {
      width: scale(38),
      height: scale(38),
      borderRadius: scale(19),
      backgroundColor: theme.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarInitial: {
      fontSize: scale(16),
      fontWeight: '700',
      color: theme.primary,
    },
    headerLeft: {
      flex: 1,
      marginLeft: scale(10),
    },
    greeting: {
      fontSize: scale(20),
      fontWeight: '700',
      color: theme.heading,
    },
    subtitle: {
      fontSize: scale(11),
      color: theme.subText,
      marginTop: scale(2),
    },
    notifBtn: {
      width: scale(36),
      height: scale(36),
      borderRadius: scale(12),
      backgroundColor: theme.cardBg,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 1,
    },
    scrollView: {
      flex: 1,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.inputBg,
      marginHorizontal: scale(16),
      borderRadius: scale(10),
      paddingHorizontal: scale(12),
      paddingVertical: scale(10),
      borderWidth: 1,
      borderColor: theme.border,
    },
    searchText: {
      fontSize: scale(12),
      color: theme.placeholder,
      marginLeft: scale(8),
      flex: 1,
    },
    section: {
      marginTop: scale(18),
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: scale(16),
      marginBottom: scale(10),
    },
    sectionTitle: {
      fontSize: scale(15),
      fontWeight: '700',
      color: theme.heading,
    },
    seeAll: {
      fontSize: scale(11),
      fontWeight: '600',
      color: theme.primary,
    },
    listContent: {
      paddingHorizontal: scale(16),
    },
    featuredCard: {
      width: FEATURED_CARD_W,
      height: FEATURED_CARD_H,
      borderRadius: scale(14),
      overflow: 'hidden',
      marginRight: scale(12),
    },
    featuredImage: {
      width: '100%',
      height: '100%',
    },
    featuredOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    featuredContent: {
      position: 'absolute',
      bottom: scale(12),
      left: scale(14),
      right: scale(14),
    },
    featuredName: {
      fontSize: scale(17),
      fontWeight: '700',
      color: '#FFFFFF',
    },
    featuredRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: scale(4),
    },
    featuredLocation: {
      fontSize: scale(11),
      color: 'rgba(255,255,255,0.9)',
      marginLeft: scale(4),
    },
    featuredRating: {
      position: 'absolute',
      top: scale(10),
      right: scale(10),
      backgroundColor: 'rgba(0,0,0,0.5)',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: scale(7),
      paddingVertical: scale(3),
      borderRadius: scale(7),
    },
    featuredRatingText: {
      fontSize: scale(10),
      fontWeight: '700',
      color: '#FFFFFF',
      marginLeft: scale(3),
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.mainBg,
    },
    errorText: {
      fontSize: scale(14),
      color: theme.subText,
      marginBottom: scale(14),
    },
    retryButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: scale(22),
      paddingVertical: scale(9),
      borderRadius: scale(10),
    },
    retryText: {
      fontSize: scale(13),
      fontWeight: '600',
      color: theme.buttonText,
    },
    bottomSpacer: {
      height: scale(24),
    },
  });
