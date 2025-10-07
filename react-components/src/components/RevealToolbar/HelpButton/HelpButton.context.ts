import { createContext } from 'react';
import { useTranslation } from '../../i18n/I18n';
import { MouseNavigation } from '../Help/MouseNavigation';
import { TouchNavigation } from '../Help/TouchNavigation';
import { KeyboardNavigation } from '../Help/KeyboardNavigation';

export type HelpButtonDependencies = {
  useTranslation: typeof useTranslation;
  MouseNavigation: typeof MouseNavigation;
  TouchNavigation: typeof TouchNavigation;
  KeyboardNavigation: typeof KeyboardNavigation;
};

export const defaultHelpButtonDependencies: HelpButtonDependencies = {
  useTranslation,
  MouseNavigation,
  TouchNavigation,
  KeyboardNavigation
};

export const HelpButtonContext = createContext<HelpButtonDependencies>(
  defaultHelpButtonDependencies
);
