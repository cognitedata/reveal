import { Body, Colors, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useIsMutating } from '@tanstack/react-query';

import { useTranslation } from 'common';
import { useFlow } from 'hooks/raw';
import { Flow } from 'types';
import { formatTime, Timestamp } from '@cognite/cdf-utilities';

type FlowSaveIndicatorProps = {
  flowId: Flow['id'];
};

const FlowSaveIndicator = ({ flowId }: FlowSaveIndicatorProps) => {
  const { t } = useTranslation();
  const { data } = useFlow(flowId);

  //   const isLoading = useIsMutating();
  //   console.log(isLoading);

  //   if (isLoading) {
  //     return (
  //       <StyledWrapper>
  //         <StyledLoader />
  //         {t('details-saving-changes')}
  //       </StyledWrapper>
  //     );
  //   }

  if (!data?.updated) {
    return null;
  }

  if (new Date().getTime() - data.updated < 1000 * 60) {
    return <StyledWrapper>{t('details-all-changes-saved')}</StyledWrapper>;
  }

  console.log(data);

  return (
    <StyledWrapper>
      <Timestamp
        formatContent={(timestamp: number) =>
          t('last-edit-time', { time: formatTime(timestamp) })
        }
        timestamp={data.updated}
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
