import { ReactPid } from '@cognite/react-pid';
import styled from 'styled-components';

const Container = styled.div`
  height: calc(100vh - 56px);
  text-align: center;
`;

const DiagramParser = () => {
  return (
    <Container>
      <ReactPid />
    </Container>
  );
};

export default DiagramParser;
