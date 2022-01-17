import { Title } from '@cognite/cogs.js';
import { ReactPid } from '@cognite/react-pid';
import styled from 'styled-components';

const Container = styled.div`
  height: calc(100vh - 56px);
  text-align: center;
`;

const Info = () => {
  return (
    <Container>
      <Title>Diagram Parsing Tool</Title>
      <ReactPid />
    </Container>
  );
};

export default Info;
