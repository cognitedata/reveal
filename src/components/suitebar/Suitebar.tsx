import React from 'react';
import { Button, Title, Modal } from '@cognite/cogs.js';
import { SuitbarContainer } from './elements';

const Suitebar: React.FC = () => {
  return (
    <SuitbarContainer>
      <Title level={5}>Executive overview</Title>
      <Button
        variant="outline"
        type="secondary"
        icon="Plus"
        iconPlacement="left"
      >
        New suite
      </Button>
    </SuitbarContainer>
  );
};

export default Suitebar;
