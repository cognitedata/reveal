import React from 'react';

import { NavigationPanel } from 'components/NavigationPanel';
import { OverlayNavigation } from 'components/OverlayNavigation';

import { WellboreCasingView } from '../Graph';
import { CasingSchematicView } from '../types';

import { CasingPreviewWrapper } from './elements';

interface CasingPreviewProps {
  data?: CasingSchematicView;
  onBackClick: () => void;
}

export const CasingPreview: React.FC<CasingPreviewProps> = ({
  data,
  onBackClick,
}) => {
  if (!data) {
    return null;
  }

  const { wellName, wellboreName } = data;

  return (
    <OverlayNavigation mount>
      <NavigationPanel
        title={wellName}
        subtitle={wellboreName}
        onBackClick={onBackClick}
      />

      <CasingPreviewWrapper>
        <WellboreCasingView data={data} />
      </CasingPreviewWrapper>
    </OverlayNavigation>
  );
};
