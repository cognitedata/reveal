/*!
 * Copyright 2025 Cognite AS
 */
import { createContext } from 'react';
import { WindowWidgetModel } from './WindowWidgetModel';
import { useTranslation } from '../i18n/I18n';
import { useReveal } from '../RevealCanvas';

export type WindowWidgetProperties = {
  WindowWidgetModel: typeof WindowWidgetModel;
  hooks: {
    useTranslation: typeof useTranslation;
    useReveal: typeof useReveal;
  };
};

export const WindowWidgetContext = createContext<WindowWidgetProperties>({
  WindowWidgetModel,
  hooks: {
    useTranslation,
    useReveal
  }
});
