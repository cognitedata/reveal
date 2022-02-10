import { Body, Title, Table } from '@cognite/cogs.js';

import { Container } from '../elements';

import { StyledTable } from './elements';
import { pastResults, columns } from './FakeData';

const Historical = () => {
  return (
    <Container>
      <Title>Historical Data</Title>
      <Body>The table below shows run executed in the past.</Body>
      <StyledTable>
        <Table
          pagination={false}
          columns={columns as any}
          dataSource={pastResults}
        />
      </StyledTable>
    </Container>
  );
};

export default Historical;
