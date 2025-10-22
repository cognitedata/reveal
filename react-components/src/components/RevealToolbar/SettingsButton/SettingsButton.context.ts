import { Context, createContext } from 'react';
import { useTranslation } from '../../i18n/I18n';
import { HighFidelityContainer } from '../SettingsContainer/HighFidelityContainer';

export type SettingsButtonDependencies = {
  useTranslation: typeof useTranslation;
  HighFidelityContainer: typeof HighFidelityContainer;
};

export const defaultSettingsButtonDependencies: SettingsButtonDependencies = {
  useTranslation,
  HighFidelityContainer
};

export const SettingsButtonContext: Context<SettingsButtonDependencies> = createContext<SettingsButtonDependencies>(
  defaultSettingsButtonDependencies
);
