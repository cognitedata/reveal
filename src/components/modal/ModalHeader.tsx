import React from 'react';
import { Title, Button, Flex } from '@cognite/cogs.js';
import styled from 'styled-components';

const Spacer = styled.div`
  margin-right: 30px;
`;

interface Props {
  title: string;
  buttonText?: string;
  buttonIcon?: 'AddLarge' | undefined;
  onButtonAction: () => void;
}

const ModalHeader: React.FC<Props> = ({
  title,
  buttonText,
  buttonIcon,
  onButtonAction,
}) => {
  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Title level={3}>{title}</Title>
      <Flex gap={8}>
        {buttonText && (
          <Button
            type="primary"
            icon={buttonIcon}
            onClick={() => onButtonAction()}
          >
            {buttonText}
          </Button>
        )}
        <Spacer />
      </Flex>
    </Flex>
  );
};

export default ModalHeader;
