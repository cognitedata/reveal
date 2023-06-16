import styled from 'styled-components';

import { useIsMutating } from '@tanstack/react-query';
import { useTranslation } from '@transformations/common';
import { useTransformation } from '@transformations/hooks';
import { TransformationRead } from '@transformations/types';

import { formatTime, Timestamp } from '@cognite/cdf-utilities';
import { Body, Colors, Icon } from '@cognite/cogs.js';

type TransformationDetailsSaveIndicatorProps = {
  transformationId: TransformationRead['id'];
};

const TransformationDetailsSaveIndicator = ({
  transformationId,
}: TransformationDetailsSaveIndicatorProps) => {
  const { t } = useTranslation();
  const { data: transformation } = useTransformation(transformationId);

  const isLoading = useIsMutating(['transformations', 'update']);

  if (isLoading) {
    return (
      <StyledWrapper>
        <StyledLoader />
        {t('details-saving-changes')}
      </StyledWrapper>
    );
  }

  if (!transformation?.lastUpdatedTime) {
    return null;
  }

  if (new Date().getTime() - transformation.lastUpdatedTime < 1000 * 60) {
    return <StyledWrapper>{t('details-all-changes-saved')}</StyledWrapper>;
  }

  return (
    <StyledWrapper>
      <Timestamp
        formatContent={(timestamp: number) =>
          t('last-edit-time', { time: formatTime(timestamp) })
        }
        timestamp={transformation.lastUpdatedTime}
      />
    </StyledWrapper>
  );
};

const StyledWrapper = styled(Body).attrs({ level: 2 })`
  display: flex;
  align-items: center;
  color: ${Colors['text-icon--muted']};
`;

const StyledLoader = styled(Icon).attrs({ type: 'Loader' })`
  margin-right: 4px;
`;

export default TransformationDetailsSaveIndicator;
