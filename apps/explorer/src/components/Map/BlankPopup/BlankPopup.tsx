import { Button } from '@cognite/cogs.js';

import { Container, Content } from '../Popup/elements';

export const BlankPopup: React.FC = () => {
  return (
    <Container>
      <Content
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
        }}
        className="z-2"
      >
        <Button icon="Plus"> Add Information </Button>
      </Content>
    </Container>
  );
};
