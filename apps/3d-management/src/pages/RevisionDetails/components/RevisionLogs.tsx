import uniqBy from 'lodash/uniqBy';
import { Timeline } from 'antd';
import { mapStatusToColor } from 'src/components/Status';
import React from 'react';
import { RevisionLog3D } from 'src/utils/sdk/3dApiUtils';
import { useUserContext } from '@cognite/cdf-utilities';
import { AuthenticatedUserWithGroups } from '@cognite/cdf-utilities/dist/types';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { DEFAULT_MARGIN_V } from 'src/utils';

const EXTERNAL_LOG_NAME = {
  'reveal-optimizer': 'Web-Optimizer',
};

const LogTimeline = styled(Timeline)`
  margin-top: 12px;
  && .ant-timeline-item-last > .ant-timeline-item-content {
    min-height: unset;
  }
  && p {
    margin-bottom: 2px;
  }
`;

const LogsContainer = styled.div`
  margin-top: ${DEFAULT_MARGIN_V};
  display: flex;
  overflow: auto;
  && > div {
    flex: 1 220px;
    min-width: 220px;
    margin-right: 12px;
  }
`;

type Props = {
  logs: Array<RevisionLog3D>;
  isLoading?: boolean;
};

export function RevisionLogs({ logs, isLoading }: Props) {
  const user: AuthenticatedUserWithGroups = useUserContext();

  if (isLoading) {
    return <div style={{ marginTop: DEFAULT_MARGIN_V }}>Loading logs...</div>;
  }

  if (!logs.length) {
    return <div style={{ margin: DEFAULT_MARGIN_V }}>No logs found</div>;
  }

  const formatDate = (date) => dayjs(date).format('YYYY-MM-DD HH:mm');

  // order by category of pipeline (the type is given as 3d-optimizer/status), so 3d-optimizer is the category
  const organizedLogs = logs.reduce((prev, log) => {
    const { timestamp, type, info } = log;
    const [category, status] = type.split('/');
    if (!prev[category]) {
      // eslint-disable-next-line no-param-reassign
      prev[category] = [{ timestamp, type: status, info }];
    } else {
      prev[category].push({ timestamp, type: status, info });
    }
    return prev;
  }, {});

  // make sure they are uniq and visible
  const visibleLogs = {};
  const isInternalUser = user.username?.includes('@cognite.com');
  Object.keys(organizedLogs).forEach((process) => {
    if (isInternalUser) {
      visibleLogs[process] = uniqBy(
        organizedLogs[process],
        (el: any) => el.type + formatDate(el.timestamp)
      );
    } else {
      visibleLogs[EXTERNAL_LOG_NAME[process] || process] = uniqBy(
        organizedLogs[process],
        (el: any) => el.type + formatDate(el.timestamp)
      );
    }
  });

  return (
    <LogsContainer>
      {Object.keys(visibleLogs).map((process) => (
        <div key={process}>
          <b>{process.toUpperCase()}</b>
          <LogTimeline>
            {visibleLogs[process].map((log) => {
              const { timestamp, type, info } = log;
              return (
                <Timeline.Item
                  key={`${type}-${timestamp}`}
                  color={mapStatusToColor[type]}
                >
                  <b>{`${type}${info ? ` - ${info}` : ''}`}</b>
                  <p>{formatDate(timestamp)}</p>
                </Timeline.Item>
              );
            })}
          </LogTimeline>
        </div>
      ))}
    </LogsContainer>
  );
}
