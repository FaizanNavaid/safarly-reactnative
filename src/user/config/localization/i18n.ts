import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from './en.json';
import ur from './ur.json';
import {getData} from '../../services/helper/helper';

const savedLang = getData('language') || 'en';

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
