import {useSelector} from 'react-redux';
import {RootState} from '../../../config/redux/store/Store';
import {LightColors, DarkColors, ThemeColors} from '../color/color';

export const useTheme = (): ThemeColors => {
  const mode = useSelector((state: RootState) => state.theme.mode);
  return mode === 'dark' ? DarkColors : LightColors;
};
