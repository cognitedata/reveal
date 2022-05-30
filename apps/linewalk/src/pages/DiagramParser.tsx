import styled from 'styled-components';

import { DiagramParser } from '../react-pid/src';

const Container = styled.div`
  height: calc(100vh - 56px);
  text-align: center;
`;

const DiagramParserPage = () => {
  return (
    <Container>
      <DiagramParser />
    </Container>
  );
};

export default DiagramParserPage;
