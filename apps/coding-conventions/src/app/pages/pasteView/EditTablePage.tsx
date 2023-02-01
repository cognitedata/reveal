import { dummyConventions } from '../../service/conventions';
import { Title } from '@cognite/cogs.js';
import { System } from '../../types';
import { Table as EditTable } from '../../pages//pasteView/DataCleanupComponent';

import styled from 'styled-components';
import { useParams } from 'react-router-dom';

export const EditTablePage = () => {
  const { id } = useParams();

  const systemWithConvention = dummyConventions.find((system: System) =>
    system.conventions.find((SystemConvention) => SystemConvention.id === id)
  );
  const convention = systemWithConvention?.conventions.find(
    (SystemConvention) => SystemConvention.id === id
  );
  const definitions = convention?.definitions;
  return (
    <div>
      <Header>
        <Title level={2}>Edit {systemWithConvention?.title}</Title>
      </Header>
      <Container>
        <EditTable
          columns={[
            {
              Header: 'Abbreviation',
              accessor: 'key',
            },
            {
              Header: 'Description',
              accessor: 'description',
            },
          ]}
          dataSource={definitions}
        />
      </Container>
    </div>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding-bottom: 24px;
`;

const Header = styled.div`
  border-top: 1px solid #d9d9d9;
  border-bottom: 1px solid #d9d9d9;
  height: 70px;
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
  gap: 8px;
  margin-bottom: 16px;
`;
