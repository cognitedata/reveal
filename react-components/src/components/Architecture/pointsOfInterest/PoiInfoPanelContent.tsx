import { PoiCommentSection } from './PoiCommentSection';
import { type ReactNode } from 'react';
import { PoiHeader } from './PoiHeader';
import { PoiInfoSection } from './PoiInfoSection';
import { Flex } from '@cognite/cogs.js';

export const PoiInfoPanelContent = (): ReactNode => {
  return (
    <>
      <PoiHeader />
      <PanelBody />
    </>
  );
};

const PanelBody = (): ReactNode => {
  return (
    <Flex direction="column" gap={8}>
      <PoiInfoSection />
      <PoiCommentSection />
    </Flex>
  );
};
