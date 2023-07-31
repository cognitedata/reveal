import { Flex } from '@cognite/cogs.js';
import { PageHeader, PageSubHeader } from 'components/Atoms/PageHeader';
import { statusConfig } from 'configs/status.config';
import styled from 'styled-components';

import { StatusCard } from './components/StatusCard/StatusCard';
import { StatusHistoryTable } from './components/StatusHistoryTable/StatusHistoryTable';

const Content = styled.div`
  width: 1040px;
`;

const StatusContainer = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
`;

const Status = () => {
  return (
    <Flex justifyContent="center">
      <Content>
        <PageHeader
          title="System status"
          subtitle="Cognuit system connectors"
        />
        <StatusContainer>
          {statusConfig.connectors.map((connector) => (
            <StatusCard
              key={`${connector.source}+${connector.instance}`}
              source={connector.source}
              instance={connector.instance}
            />
          ))}
        </StatusContainer>

        <PageSubHeader
          title="Status history"
          subtitle="Events are displayed only for the past week"
        />
        <StatusHistoryTable />
      </Content>
    </Flex>
  );
};

export default Status;
