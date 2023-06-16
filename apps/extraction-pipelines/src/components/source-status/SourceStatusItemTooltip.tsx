import React from 'react';

import { Flex, Tooltip, Icon, IconType, Colors } from '@cognite/cogs.js';

import { useTranslation } from 'common';
import {
  UptimeAggregation,
  formatUptime,
  DailyLogAggregation,
  doesLogHaveSuccessType,
  doesLogHaveErrorType,
} from 'utils/hostedExtractors';
import { formatTime } from '@cognite/cdf-utilities';
import { MQTTSourceWithJobMetrics } from 'hooks/hostedExtractors';

type SourceStatusItemTooltipProps = {
  children: React.ReactNode;
  aggregation: UptimeAggregation;
  source: MQTTSourceWithJobMetrics;
};

const SourceStatusItemTooltip = ({
  children,
  aggregation,
  source,
}: SourceStatusItemTooltipProps): JSX.Element => {
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
    } else if (aggregation.logs.every((log) => doesLogHaveSuccessType(log))) {
      return {
        showDate: true,
        text: t('source-status-success'),
        textAlign: 'center',
      };
    } else if (aggregation.logs.some((log) => doesLogHaveErrorType(log))) {
      return {
        showDate: true,
        text: t('source-status-error', {
          logCount: aggregation.logs.filter((log) => doesLogHaveErrorType(log))
            .length,
        }),
        textAlign: 'left',
        logs: aggregation.logs.filter((log) => doesLogHaveErrorType(log)),
        iconType: 'ErrorFilled',
        iconColor: 'critical',
      };
    } else {
      return {
        showDate: true,
        text: t('source-status-other', { logCount: aggregation.logs.length }),
        textAlign: 'left',
        logs: aggregation.logs,
        iconType: 'InfoFilled',
        iconColor: 'neutral',
      };
    }
  };
  const content = getContent();

  const getTopicFilter = (log: any) => {
    const sourceJob = source.jobs.find((job) => {
      return job.externalId === log.jobExternalId;
    });
    return sourceJob?.topicFilter;
  };
  // console.log(aggregation);
  // console.log(aggregation.log);

  return (
    <div css={{ flex: 1 }}>
      <Tooltip
        content={
          <Flex direction="column">
            <span>{formatTime(aggregation.endTime, true)}</span>
            <span>
              <Flex>
                {aggregation.uptimePercentage !== -1 && content.iconType && (
                  <Icon
                    type={content.iconType}
                    css={{
                      color:
                        Colors[
                          `text-icon--status-${content.iconColor}--inverted`
                        ],
                    }}
                  />
                )}
                {aggregation.uptimePercentage === -1
                  ? t('source-status-no-data')
                  : t('uptime-with-percentage', {
                      percentage: formatUptime(aggregation.uptimePercentage),
                    })}
              </Flex>
            </span>
            {aggregation.logs.filter((log) => {
              return log.type === 'stopped';
            }).length > 0 && (
              <span>
                <Flex alignItems="center">
                  {content.iconType && (
                    <Icon
                      type={content.iconType}
                      css={{
                        color:
                          Colors[
                            `text-icon--status-${content.iconColor}--inverted`
                          ],
                      }}
                    />
                  )}
                  {content.text}
                </Flex>
                {content.logs &&
                  content.logs.map((log) => (
                    <div key={log.createdTime}>{getTopicFilter(log)}</div>
                  ))}
              </span>
            )}
          </Flex>
        }
        position="top"
      >
        <>{children}</>
      </Tooltip>
    </div>
  );
};

export default SourceStatusItemTooltip;
