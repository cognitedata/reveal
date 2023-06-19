import React from 'react';

import { formatTime } from '@cognite/cdf-utilities';
import { Flex, Tooltip } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { UptimeAggregation, formatUptime } from '../../utils/hostedExtractors';

type SourceStatusItemTooltipProps = {
  children: React.ReactNode;
  aggregation: UptimeAggregation;
};

const SourceStatusItemTooltip = ({
  children,
  aggregation,
}: SourceStatusItemTooltipProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div css={{ flex: 1 }}>
      <Tooltip
        content={
          <Flex direction="column">
            <span>{formatTime(aggregation.endTime, true)}</span>
            <span>
              {aggregation.uptimePercentage === -1
                ? t('source-status-no-data')
                : t('uptime-with-percentage', {
                    percentage: formatUptime(aggregation.uptimePercentage),
                  })}
            </span>
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
