import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {I18nManager} from 'react-native'
import RNRestart from 'react-native-restart'
import i18n from '../../localization/i18n'
import {storeData} from '../../../services/helper/helper'

export type AppLanguage = 'en' | 'ur'

const RTL_LANGUAGES: AppLanguage[] = ['ur']

type LanguageState = {
  lang: AppLanguage
}

const initialState: LanguageState = {
  lang: (i18n.language as AppLanguage) || 'en',
}

const applyLanguage = (lang: AppLanguage) => {
  const isRTL = RTL_LANGUAGES.includes(lang)
  i18n.changeLanguage(lang)
  storeData('language', lang)

  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL)
    I18nManager.forceRTL(isRTL)
    setTimeout(() => RNRestart.restart(), 300)
  }
}

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    toggleLanguage: state => {
      const newLang: AppLanguage = state.lang === 'en' ? 'ur' : 'en'
      state.lang = newLang
      applyLanguage(newLang)
    },
    setLanguage: (state, action: PayloadAction<AppLanguage>) => {
      state.lang = action.payload
      applyLanguage(action.payload)
    },
  },
})

export const {toggleLanguage, setLanguage} = languageSlice.actions
export default languageSlice.reducer
