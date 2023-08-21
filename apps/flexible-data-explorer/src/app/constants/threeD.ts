import { ComponentProps } from 'react';

import { Color } from 'three';

import { RevealContainer } from '@cognite/reveal-react-components';

export const defaultResourceStyling = {
  cad: {
    default: { color: new Color('#efefef') },
    mapped: { color: new Color('#c5cbff') },
  },
};

export const defaultViewerOptions: ComponentProps<
  typeof RevealContainer
>['viewerOptions'] = {
  loadingIndicatorStyle: {
    placement: 'topRight',
    opacity: 0.2,
  },
  antiAliasingHint: 'msaa2+fxaa',
  ssaoQualityHint: 'medium',
};

export const defaultRevealColor = new Color(0x4a4a4b);
