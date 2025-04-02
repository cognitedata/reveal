import { createContext } from 'react';
import { RevealRenderTarget } from '../../../architecture';
import { I18nContent } from '../../i18n/types';
import { useRenderTarget } from '../../RevealCanvas';
import { useTranslation } from '../../i18n/I18n';

export type InputFieldViewModelDependencies = {
  useRenderTarget: typeof useRenderTarget;
  useTranslation: typeof useTranslation;
};

export const InputFieldContext = createContext<InputFieldViewModelDependencies>({
  useRenderTarget,
  useTranslation
});
