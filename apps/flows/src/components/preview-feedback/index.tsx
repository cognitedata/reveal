import styled from 'styled-components';

import { useTranslation, Z_INDEXES } from '@flows/common';

import { Flex, Infobox } from '@cognite/cogs.js';

export default function PreviewFeedback() {
  const { t } = useTranslation();
  return (
    <FloatingPanel>
      <Flex direction="column" justifyContent="space-around">
        <Infobox style={{ width: 300, opacity: 1 }} type="warning">
          {t('preview-warning')}
        </Infobox>
      </Flex>
    </FloatingPanel>
  );
}

const FloatingPanel = styled(Flex).attrs({ justifyContent: 'space-around' })`
  background-color: white;
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0.5;
  z-index: ${Z_INDEXES.FLOATING_ELEMENT};
`;
