import { useEffect, useState } from 'react';
import {
  Timeseries,
  CogniteClient,
  StringDatapoint,
  DoubleDatapoint,
} from '@cognite/sdk';
import dayjs from 'dayjs';
import { Icon } from '@cognite/cogs.js';
import { TimeSeriesTag } from 'typings';

import { TimeseriesTagWrapper } from './elements';

export type TimeSeriesTagProps = {
  timeseries: Timeseries;
  client: CogniteClient;
  attrs: TimeSeriesTag;
  rule?: string;
  onDelete?: () => void;
  onChangeSettings?: () => void;
};

const isPointBreakingRule = (
  value?: number,
  rule?: {
    type: 'LIMIT';
    min?: number;
    max?: number;
  }
) => {
  if (!value) {
    return false;
  }
  const { type, min, max } = rule || {};
  if (type === 'LIMIT') {
    if (min && min > value) {
      return `Value is UNDER set limit of ${min}`;
    }
    if (max && max < value) {
      return `Value is OVER set limit of ${max}`;
    }
  }
  return false;
};

const TimeseriesTag = ({
  timeseries,
  client,
  attrs,
  onDelete,
  onChangeSettings,
}: TimeSeriesTagProps) => {
  const { color = 'red', link, sticky, rule } = attrs;
  const [datapoint, setDatapoint] = useState<
    StringDatapoint | DoubleDatapoint
  >();

  const refreshDatapoint = async () => {
    const datapoint = await client.datapoints
      .retrieveLatest([
        timeseries.externalId
          ? { externalId: timeseries.externalId }
          : { id: timeseries.id },
      ])
      .then((res) => res[0].datapoints[0]);
    setDatapoint(datapoint);
  };

  useEffect(() => {
    refreshDatapoint();
    const interval = setInterval(refreshDatapoint, 30000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const alert = isPointBreakingRule(Number(datapoint?.value), rule);

  return (
    <TimeseriesTagWrapper color={color} sticky={sticky}>
      <div className={`tag--handle ${alert ? 'alert' : ''}`} />
      <div className="tag--content">
        <div className="tag--value">
          {datapoint?.value}
          <span className="tag--value-unit">{timeseries.unit}</span>
        </div>
        <div className="tag--timestamp">
          {dayjs(datapoint?.timestamp).format('LLL')}
        </div>
        <div className="tag--hoverbox top">
          <div className="tag--name">{timeseries.name}</div>
        </div>

        {alert && (
          <div className="tag--hoverbox bottom">
            <div className="tag--rule">{alert}</div>
          </div>
        )}
        <div className="tag--actions">
          {link?.URL && (
            <a
              className="tag--link"
              href={link.URL}
              target="_blank"
              rel="noreferrer"
            >
              <Icon type="ExternalLink" />
            </a>
          )}
          {onChangeSettings && (
            <button
              type="button"
              className="tag--settings"
              onClick={onChangeSettings}
            >
              <Icon type="Expand" />
            </button>
          )}
          {onDelete && (
            <button type="button" className="tag--delete" onClick={onDelete}>
              <Icon type="Delete" />
            </button>
          )}
        </div>
      </div>
    </TimeseriesTagWrapper>
  );
};

export default TimeseriesTag;
