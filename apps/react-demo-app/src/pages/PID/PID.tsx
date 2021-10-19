import { Title } from '@cognite/cogs.js';
import { SvgViewer } from '@cognite/react-pid';

import { Container } from '../elements';

const Info = () => {
  return (
    <Container>
      <Title>Engineering Diagram Parsing Tool</Title>
      <SvgViewer />
    </Container>
  );
};

export default Info;
