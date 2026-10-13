import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {getData, storeData} from '../../../services/helper/helper'

export type ThemeMode = 'light' | 'dark'

type ThemeState = {
  mode: ThemeMode
}

const saved = getData('theme') as ThemeMode | undefined

const initialState: ThemeState = {
  mode: saved || 'light',
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: state => {
      const newMode: ThemeMode = state.mode === 'light' ? 'dark' : 'light'
      state.mode = newMode
      storeData('theme', newMode)
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload
      storeData('theme', action.payload)
    },
  },
})

export const {toggleTheme, setTheme} = themeSlice.actions
export default themeSlice.reducer
