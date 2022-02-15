import { Wellbore } from '@cognite/sdk-wells-v2/dist/src';

import { DEFAULT_WELLBORE_COLOR } from 'pages/authorized/search/well/inspect/Sidebar/constants';

export const addColor =
  (isColoredWellbores: boolean) =>
  <T extends Wellbore>(wellbore: T) => {
    const color = isColoredWellbores
      ? (wellbore as any).metadata?.color.replace('_', '')
      : DEFAULT_WELLBORE_COLOR;

    return {
      ...wellbore,
      color,
    };
  };
