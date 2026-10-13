import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import i18n from '../../localization/i18n'
import {storeData} from '../../../services/helper/helper'

export type AppLanguage = 'en' | 'ur'

type LanguageState = {
  lang: AppLanguage
}

const initialState: LanguageState = {
  lang: (i18n.language as AppLanguage) || 'en',
}

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    toggleLanguage: state => {
      const newLang: AppLanguage = state.lang === 'en' ? 'ur' : 'en'
      state.lang = newLang
      i18n.changeLanguage(newLang)
      storeData('language', newLang)
    },
    setLanguage: (state, action: PayloadAction<AppLanguage>) => {
      state.lang = action.payload
      i18n.changeLanguage(action.payload)
      storeData('language', action.payload)
    },
  },
})

export const {toggleLanguage, setLanguage} = languageSlice.actions
export default languageSlice.reducer
