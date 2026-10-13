import {configureStore} from '@reduxjs/toolkit';
import {useSelector, TypedUseSelectorHook} from 'react-redux';
import languageReducer from '../slice/languageSlice';
import themeReducer from '../slice/themeSlice';
import userReducer from '../slice/userSlice';

export const store = configureStore({
  reducer: {
    language: languageReducer,
    theme: themeReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
