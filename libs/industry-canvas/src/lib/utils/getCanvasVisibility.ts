import { IconType } from '@cognite/cogs.js';

import { translationKeys } from '../common';
import { TFunctionType } from '../hooks/useTranslation';
import { CanvasVisibility } from '../services/IndustryCanvasService';

export const getCanvasVisibilityIcon = (visibility?: string): IconType => {
  if (visibility === CanvasVisibility.PUBLIC) {
    return 'Building';
  }
  if (visibility === CanvasVisibility.PRIVATE) {
    return 'User';
  }

  return 'User';
};

export const getCanvasVisibilityTooltipText = (
  t: TFunctionType,
  visibility?: string
): string | undefined => {
  const publicTooltipText = t(translationKeys.VISIBILITY_PUBLIC, 'Public');
  const privateTooltipText = t(translationKeys.VISIBILITY_PRIVATE, 'Private');

  if (visibility === CanvasVisibility.PUBLIC) {
    return publicTooltipText;
  }
  if (visibility === CanvasVisibility.PRIVATE) {
    return privateTooltipText;
  }

  // The default case for the previous canvases which has no data for visibility
  return privateTooltipText;
};

export const getCanvasVisibilityBodyText = (
  t: TFunctionType,
  visibility?: string
): string | undefined => {
  const publicTextBody = t(
    translationKeys.VISIBILITY_MODAL_PUBLIC_TOGGLE_BODY,
    'This canvas is visible to everyone in this project.'
  );
  const privateTextBody = t(
    translationKeys.VISIBILITY_MODAL_PRIVATE_TOGGLE_BODY,
    'This canvas is visible for you and everyone you have shared it with.'
  );

  if (visibility === CanvasVisibility.PUBLIC) {
    return publicTextBody;
  }
  if (visibility === CanvasVisibility.PRIVATE) {
    return privateTextBody;
  }

  // The default case for the previous canvases which has no data for visibility
  return privateTextBody;
};

export const getCanvasVisibilityToggleText = (
  t: TFunctionType,
  visibility?: string
): string => {
  const publicText = t(translationKeys.VISIBILITY_PUBLIC, 'Public');
  const privateText = t(translationKeys.VISIBILITY_PRIVATE, 'Private');

  // This is the text to use for actions to toggle visibility.
  if (visibility === CanvasVisibility.PUBLIC) {
    return privateText.toLowerCase();
  } else {
    return publicText.toLowerCase();
  }
};
