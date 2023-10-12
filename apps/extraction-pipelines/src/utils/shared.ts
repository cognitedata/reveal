import { CodeEditorTheme } from '@cognite/cdf-utilities';

import {
  CODE_EDITOR_THEME_LOCAL_STORAGE_KEY,
  DEFAULT_CODE_EDITOR_THEME,
} from './constants';

export const getSelectedCodeEditorTheme = (): CodeEditorTheme => {
  const theme = localStorage.getItem(CODE_EDITOR_THEME_LOCAL_STORAGE_KEY);
  switch (theme) {
    case 'light':
      return 'light';
    case 'dark':
      return 'dark';
    default:
      return DEFAULT_CODE_EDITOR_THEME;
  }
};

export const setSelectedCodeEditorTheme = (theme: CodeEditorTheme): void => {
  localStorage.setItem(CODE_EDITOR_THEME_LOCAL_STORAGE_KEY, theme);
};
