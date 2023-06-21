import React from 'react';

import { Flex, Tooltip, Icon, Colors } from '@cognite/cogs.js';

import { useTranslation } from 'common';
import {
  UptimeAggregation,
  formatUptime,
  doesLogHavePauseType,
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

  const getUptimeIcon = (uptimePercentage: number) => {
    if (uptimePercentage === 100) {
      return (
        <Icon
          type="CheckmarkFilled"
          css={{
            color: Colors[`text-icon--status-success--inverted`],
          }}
        />
      );
    }

    if (uptimePercentage >= 99.5) {
      return (
        <Icon
          type="WarningFilled"
          css={{
            color: Colors[`text-icon--status-warning--inverted`],
          }}
        />
      );
    }

    if (uptimePercentage >= 0 && uptimePercentage < 99.5) {
      return (
        <Icon
          type="ErrorFilled"
          css={{
            color: Colors[`text-icon--status-critical--inverted`],
          }}
        />
      );
    }

    return (
      <Icon
        type="InfoFilled"
        css={{
          color: Colors[`text-icon--status-neutral--inverted`],
        }}
      />
    );
  };

  const isPausedEntireTime = aggregation.logs.every((log) => {
    return doesLogHavePauseType(log);
  });

  const pausedOnlyLogs = aggregation.logs.filter((log) => {
    return doesLogHavePauseType(log);
  });

  const getTopicFilter = (log: ReadMQTTJobLog) => {
    const sourceJob = source.jobs.find((job) => {
      return job.externalId === log.jobExternalId;
    });
    return sourceJob?.topicFilter;
  };

  return (
    <div css={{ flex: 1 }}>
      <Tooltip
        content={
          <Flex direction="column">
            <span>{formatTime(aggregation.endTime, true)}</span>
            <span>
              <Flex css={{ gap: '5px' }}>
                {aggregation.uptimePercentage !== -1 &&
                  isPausedEntireTime === false &&
                  getUptimeIcon(aggregation.uptimePercentage)}
                {isPausedEntireTime === false &&
                  (aggregation.uptimePercentage === -1
                    ? t('source-status-no-data')
                    : t('uptime-with-percentage', {
                        percentage: formatUptime(aggregation.uptimePercentage),
                      }))}
              </Flex>
            </span>
            {pausedOnlyLogs.length > 0 && (
              <span>
                <Flex alignItems="center" css={{ gap: '5px' }}>
                  <Icon
                    type="InfoFilled"
                    css={{
                      color: Colors[`text-icon--status-neutral--inverted`],
                    }}
                  />
                  {isPausedEntireTime
                    ? t('source-status-other', {
                        count: pausedOnlyLogs.length,
                      })
                    : t('source-status-earlier-pause', {
                        count: pausedOnlyLogs.length,
                      })}
                </Flex>
                {pausedOnlyLogs &&
                  pausedOnlyLogs.map((log) => (
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
