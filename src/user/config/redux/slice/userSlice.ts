import {createSlice, PayloadAction} from '@reduxjs/toolkit'

type UserState = {
  token: string
  isLoggedIn: boolean
  firstName: string | null
  lastName: string | null
  name: string | null
  email: string | null
  phone: string | null
  avatar: string | null
  isVerified: boolean | null
  createdAt: string | null
  profileLoaded: boolean
}

const initialState: UserState = {
  token: '',
  isLoggedIn: false,
  firstName: null,
  lastName: null,
  name: null,
  email: null,
  phone: null,
  avatar: null,
  isVerified: null,
  createdAt: null,
  profileLoaded: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
      state.isLoggedIn = true
    },
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload }
    },
    clearUser: () => initialState,
    logoutUser: () => initialState,
  },
})

export const {setToken, setUser, clearUser, logoutUser} = userSlice.actions
export default userSlice.reducer
