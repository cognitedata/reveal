import styled from 'styled-components';

import { useTranslation } from '@flows/common';
import { useWorkflowBuilderContext } from '@flows/contexts/WorkflowContext';
import { useIsMutating } from '@tanstack/react-query';

import { formatTime, Timestamp } from '@cognite/cdf-utilities';
import { Body, Colors, Icon } from '@cognite/cogs.js';

const FlowSaveIndicator = () => {
  const { t } = useTranslation();
  const { flow } = useWorkflowBuilderContext();

  const isLoading = useIsMutating();

  if (isLoading) {
    return (
      <StyledWrapper>
        <StyledLoader />
        {t('details-saving-changes')}
      </StyledWrapper>
    );
  }

  if (!flow.updated) {
    return null;
  }

  if (new Date().getTime() - flow.updated < 1000 * 60) {
    return <StyledWrapper>{t('details-all-changes-saved')}</StyledWrapper>;
  }

  return (
    <StyledWrapper>
      <Timestamp
        formatContent={(timestamp: number) =>
          t('last-edit-time', { time: formatTime(timestamp) })
        }
        timestamp={flow.updated}
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

export default FlowSaveIndicator;
