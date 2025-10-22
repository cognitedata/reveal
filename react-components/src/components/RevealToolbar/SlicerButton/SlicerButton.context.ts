import { Context, createContext } from 'react';
import { useReveal } from '../../RevealCanvas/ViewerContext';
import { useTranslation } from '../../i18n/I18n';
import { use3dModels } from '../../../hooks/use3dModels';

export type SlicerButtonDependencies = {
  useReveal: typeof useReveal;
  useTranslation: typeof useTranslation;
  use3dModels: typeof use3dModels;
};

export const defaultSlicerButtonDependencies: SlicerButtonDependencies = {
  useReveal,
  useTranslation,
  use3dModels
};

export const SlicerButtonContext: Context<SlicerButtonDependencies> = createContext<SlicerButtonDependencies>(
  defaultSlicerButtonDependencies
);
