import React from 'react';
import { formatTime } from '@cognite/cdf-utilities';
import { Flex, IconType, Icon, Colors } from '@cognite/cogs.js';
import styled from 'styled-components';
import {
  DailyLogAggregation,
  doesLogHaveSuccessType,
  doesLogHaveErrorType,
} from 'utils/hostedExtractors';
import { useTranslation } from 'common';
import { MQTTSourceWithJobMetrics } from 'hooks/hostedExtractors';

type SourceStatusItemTooltipContentProps = {
  aggregation: DailyLogAggregation;
  source: MQTTSourceWithJobMetrics;
};

const SourceStatusItemTooltipContent = ({
  aggregation,
  source,
}: SourceStatusItemTooltipContentProps): JSX.Element => {
  const { t } = useTranslation();

  const getContent = (): {
    showDate: boolean;
    text: string;
    textAlign: any;
    logs?: DailyLogAggregation['logs'];
    iconType?: IconType;
    iconColor?: 'critical' | 'neutral';
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
    } else if (aggregation.logs.some((log) => doesLogHaveErrorType(log))) {
      return {
        showDate: true,
        text: `${
          aggregation.logs.filter((log) => doesLogHaveErrorType(log)).length
        } errors:`,
        textAlign: 'left',
        logs: aggregation.logs.filter((log) => doesLogHaveErrorType(log)),
        iconType: 'ErrorFilled',
        iconColor: 'critical',
      };
    } else {
      return {
        showDate: true,
        text: `${aggregation.logs.length} errors:`,
        textAlign: 'left',
        logs: aggregation.logs,
        iconType: 'InfoFilled',
        iconColor: 'neutral',
      };
    }
  };
  const content = getContent();

  const getTopicFilter = (log: any) => {
    console.log(log.externalId);
    console.log(source);
    const sourceJob = source.jobs.find((job) => {
      return job.externalId === log.jobExternalId;
    });
    console.log(sourceJob);
    return sourceJob?.topicFilter;
  };

  return (
    <StyledTooltipContent
      direction="column"
      gap={8}
      css={{ textAlign: content.textAlign }}
    >
      {content.showDate && formatTime(aggregation.date)}
      <Flex alignItems="center" gap={8}>
        {content.iconType && (
          <Icon
            type={content.iconType}
            css={{ color: Colors[`text-icon--status-${content.iconColor}`] }}
          />
        )}
        {content.text}
      </Flex>
      {content.logs &&
        content.logs.map((log) => (
          <div key={log.createdTime}>{getTopicFilter(log)}</div>
        ))}
    </StyledTooltipContent>
  );
};

const StyledTooltipContent = styled(Flex)`
  padding: 8px;
`;

export default SourceStatusItemTooltipContent;
