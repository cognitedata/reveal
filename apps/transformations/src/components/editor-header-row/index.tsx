import styled from 'styled-components';

import { EDITOR_TITLE_HEIGHT, useTranslation } from '@transformations/common';
import PageLayoutButton from '@transformations/components/page-direction-button';
import { isMappingMode } from '@transformations/components/source-mapping/utils';
import { useTransformation } from '@transformations/hooks';
import { useTransformationContext } from '@transformations/pages/transformation-details/TransformationContext';

import { Colors, Flex, Title } from '@cognite/cogs.js';

import ModeSwitch from './ModeSwitch';

type Props = {
  transformationId: number;
};

export default function EditorTitleRow({ transformationId }: Props) {
  const { t } = useTranslation();
  const { data: transformation } = useTransformation(transformationId);
  const mappingEnabled = isMappingMode(transformation?.query);

  const { pageLayout } = useTransformationContext();

  return (
    <StyledTitleBar>
      <Title level={5}>
        {t(
          mappingEnabled
            ? 'details-editor-mapping-title'
            : 'details-editor-sql-title'
        )}
      </Title>
      <Flex gap={8}>
        {transformation && <ModeSwitch transformation={transformation} />}
        {pageLayout === 'editor-only' && <PageLayoutButton />}
      </Flex>
    </StyledTitleBar>
  );
}

const StyledTitleBar = styled(Flex)`
  align-items: center;
  border-bottom: 1px solid ${Colors['border--status-undefined--muted']};
  height: ${EDITOR_TITLE_HEIGHT}px;
  gap: 16px;
  justify-content: space-between;
  padding: 8px 12px;
`;
