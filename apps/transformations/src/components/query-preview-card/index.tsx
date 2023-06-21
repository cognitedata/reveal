import { useMemo } from 'react';

import styled from 'styled-components';

import { useQueryClient } from '@tanstack/react-query';
import { PREVIEW_TAB_HEIGHT, useTranslation } from '@transformations/common';
import {
  getTransformationPreviewKey,
  useSchema,
  useTransformationPreview,
} from '@transformations/hooks';
import { PreviewTab } from '@transformations/pages/transformation-details/TransformationContext';
import { TransformationRead } from '@transformations/types';
import { getPreviewWarnings } from '@transformations/utils';

import { Button, Colors, Elevations, Flex, Icon } from '@cognite/cogs.js';

import InvalidQueryPreview from './InvalidQueryPreview';
import ValidQueryPreview from './ValidQueryPreview';

type QueryPreviewCardProps = {
  className?: string;
  tab: PreviewTab;
  transformation: TransformationRead;
};

const QueryPreviewCard = ({
  className,
  tab,
  transformation,
}: QueryPreviewCardProps) => {
  const { key, limit, query, sourceLimit } = tab;
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const {
    data: preview,
    fetchStatus,
    isInitialLoading,
    status,
  } = useTransformationPreview(query, limit, sourceLimit, key);

  const { data: schema } = useSchema({
    destination: transformation.destination,
    action: transformation.conflictMode,
  });

  const warnings = useMemo(
    () => getPreviewWarnings(preview?.data, schema, transformation.destination),
    [preview, schema, transformation.destination]
  );

  const didCancelPreview = fetchStatus === 'idle' && status === 'loading';

  const cancelPreview = (): void => {
    queryClient.cancelQueries(
      getTransformationPreviewKey(query, limit, sourceLimit, key)
    );
  };

  if (isInitialLoading) {
    return (
      <StyledLoadingStateContainer className={className}>
        <Flex direction="column" justifyContent="space-around" gap={8}>
          <Flex alignItems="center" gap={10}>
            <Icon type="Loader" />
            {t('details-results-loading')}
          </Flex>
          <Button onClick={cancelPreview}>{t('cancel')}</Button>
        </Flex>
      </StyledLoadingStateContainer>
    );
  }

  if (didCancelPreview || !preview) {
    return null;
  }

  if (preview?.invalidQuery) {
    return (
      <InvalidQueryPreview
        className={className}
        data={preview}
        tabKey={tab.key}
      />
    );
  } else {
    return (
      <ValidQueryPreview
        className={className}
        data={preview}
        tabKey={tab.key}
        warnings={warnings}
      />
    );
  }
};

const StyledLoadingStateContainer = styled(Flex).attrs({
  justifyContent: 'center',
  alignItems: 'center',
  direction: 'column',
})`
  background-color: ${Colors['surface--muted']};
  border: 1px solid ${Colors['border--interactive--disabled']};
  border-radius: 6px;
  display: flex;
  height: ${PREVIEW_TAB_HEIGHT}px; /* TODO: make it responsive */
  min-height: ${PREVIEW_TAB_HEIGHT}px; /* TODO: make it responsive */
  flex-direction: column;
  width: 100%;
  box-shadow: ${Elevations['elevation--surface--non-interactive']};
  :hover {
    box-shadow: ${Elevations['elevation--surface--interactive']};
  }
`;

export default QueryPreviewCard;
