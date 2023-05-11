import React from 'react';
import { formatTime } from '@cognite/cdf-utilities';
import { Flex } from '@cognite/cogs.js';
import styled from 'styled-components';
import {
  DailyLogAggregation,
  doesLogHaveSuccessType,
} from 'utils/hostedExtractors';
import { useTranslation } from 'common';

type SourceStatusItemTooltipContentProps = {
  aggregation: DailyLogAggregation;
};

const SourceStatusItemTooltipContent = ({
  aggregation,
}: SourceStatusItemTooltipContentProps): JSX.Element => {
  const { t } = useTranslation();

  const getContent = (): {
    showDate: boolean;
    text: string;
    textAlign: any;
  } => {
    if (aggregation.logs.length === 0) {
      return {
        showDate: false,
        text: t('source-status-no-data'),
        textAlign: 'center',
      };
    } else if (aggregation.logs.some((log) => doesLogHaveSuccessType(log))) {
      return {
        showDate: true,
        text: t('source-status-success'),
        textAlign: 'center',
      };
    } else {
      return {
        showDate: true,
        text: '',
        textAlign: 'left',
      };
    }
  };
  const content = getContent();

  return (
    <StyledTooltipContent
      direction="column"
      gap={8}
      style={{ textAlign: content.textAlign }}
    >
      {content.showDate && formatTime(aggregation.date)}
      <div>{content.text}</div>
    </StyledTooltipContent>
  );
};

const StyledTooltipContent = styled(Flex)`
  padding: 8px;
`;

export default SourceStatusItemTooltipContent;
