import { Title } from '@cognite/cogs.js';
import { SvgViewer } from '@cognite/react-pid';
import styled from 'styled-components';

const Container = styled.div`
  height: calc(100vh - 56px);
  text-align: center;
`;

const Info = () => {
  return (
    <Container>
      <Title>Engineering Diagram Parsing Tool</Title>
      <SvgViewer />
    </Container>
  );
};

export default Info;
