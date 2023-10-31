import React from 'react';

import styled from 'styled-components';

import { Timeline } from 'antd';
import dayjs from 'dayjs';
import uniqBy from 'lodash/uniqBy';

import { mapStatusToColor } from '../../../components/Status';
import { useUserInformation } from '../../../hooks/useUserInformation';
import { DEFAULT_MARGIN_V } from '../../../utils';
import { getOrganizedRevisionLogs } from '../../../utils/getOrganizedRevisionLogs';
import { RevisionLog3D } from '../../../utils/sdk/3dApiUtils';
import { OrganizedRevisionLog } from '../../../utils/types';

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
  display: flex;
  overflow: auto;
  & > div {
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
  const { data: user } = useUserInformation();

  if (isLoading) {
    return <div style={{ marginTop: DEFAULT_MARGIN_V }}>Loading logs...</div>;
  }

  if (!logs.length) {
    return <div style={{ margin: DEFAULT_MARGIN_V }}>No logs found</div>;
  }

  const formatDate = (date) => dayjs(date).format('YYYY-MM-DD HH:mm');

  // order by category of pipeline (the type is given as 3d-optimizer/status), so 3d-optimizer is the category
  const organizedLogs = getOrganizedRevisionLogs(logs);

  // make sure they are uniq and visible
  const visibleLogs = {};
  const userEmail = user?.mail;
  const isInternalUser = userEmail?.includes('@cognite.com');
  Object.keys(organizedLogs).forEach((process) => {
    if (isInternalUser) {
      visibleLogs[process] = uniqBy(
        organizedLogs[process],
        (el: OrganizedRevisionLog) => el.type + el.timestamp + el.info
      );
    } else {
      visibleLogs[EXTERNAL_LOG_NAME[process] || process] = uniqBy(
        organizedLogs[process],
        (el: OrganizedRevisionLog) => el.type + el.timestamp + el.info
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
