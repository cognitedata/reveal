import React from 'react';
import { Button, Title } from '@cognite/cogs.js';
import { SuitbarContainer } from './elements';

interface Props {
  backNavigation?: React.ReactNode;
  buttonText: string;
}

const Suitebar: React.FC<Props> = ({ buttonText }: Props) => {
  return (
    <SuitbarContainer>
      <Title level={5}>Executive overview</Title>
      <Button
        variant="outline"
        type="secondary"
        icon="Plus"
        iconPlacement="left"
      >
        {buttonText}
      </Button>
    </SuitbarContainer>
  );
};

export default Suitebar;
