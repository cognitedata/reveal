import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Title } from '@cognite/cogs.js';
import {
  SuitbarContainer,
  MainContent,
  StyledTitle,
  StyledButton,
} from './elements';

interface Props {
  leftCustomHeader?: React.ReactNode;
  buttonText: string;
  backNavigation?: boolean;
}

const Suitebar: React.FC<Props> = ({
  buttonText,
  leftCustomHeader,
  backNavigation,
}: Props) => {
  const history = useHistory();

  const goBack = () => {
    return history.goBack();
  };
  return (
    <SuitbarContainer>
      {backNavigation && (
        <StyledButton>
          <Button
            type="secondary"
            icon="ArrowBack"
            iconPlacement="left"
            onClick={goBack}
          >
            Back
          </Button>
        </StyledButton>
      )}
      <MainContent>
        {leftCustomHeader}
        {!leftCustomHeader && (
          <Title as={StyledTitle} level={5}>
            Executive overview
          </Title>
        )}
        <Button
          variant="outline"
          type="secondary"
          icon="Plus"
          iconPlacement="left"
        >
          {buttonText}
        </Button>
      </MainContent>
    </SuitbarContainer>
  );
};

export default Suitebar;
