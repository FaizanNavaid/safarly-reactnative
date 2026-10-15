import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {I18nManager} from 'react-native';
import en from './en.json';
import ur from './ur.json';
import {getData} from '../../services/helper/helper';

const RTL_LANGUAGES = ['ur'];
const savedLang = getData('language') || 'en';
const isRTL = RTL_LANGUAGES.includes(savedLang);

if (I18nManager.isRTL !== isRTL) {
  I18nManager.allowRTL(isRTL);
  I18nManager.forceRTL(isRTL);
}

i18n.use(initReactI18next).init({
  resources: {
    en: {translation: en},
    ur: {translation: ur},
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: {escapeValue: false},
});

export default i18n;
