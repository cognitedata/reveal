import {
  Body,
  Button,
  Colors,
  Flex,
  Icon,
  Title,
  Elevations,
} from '@cognite/cogs.js';
import styled from 'styled-components';
import { useHistory, useParams } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';
import { useTranslation } from 'common';

const CreateExtractor = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { subAppPath } = useParams<{ subAppPath?: string }>();
  return (
    <StyledContainer
      onClick={() => {
        history.push(createLink(`/${subAppPath}/new`));
      }}
    >
      <StyledIconContainer>
        <Icon size={24} type="Plus" />
      </StyledIconContainer>
      <Flex direction="column" alignItems="flex-start">
        <Title level="4">{t('create-your-own-extractor')}</Title>
        <StyledMutedDescription>
          {t('use-our-tools-and-libraries')}
        </StyledMutedDescription>
      </Flex>
    </StyledContainer>
  );
};

export default CreateExtractor;

const StyledContainer = styled(Button).attrs({ variant: 'ghost' })`
  display: flex;
  justify-content: flex-start;
  gap: 16px;
  background-color: white;
  border: 1px solid ${Colors['border--interactive--default']};
  border-radius: 6px;
  width: 100%;
  cursor: pointer;
  transition: box-shadow 500ms ease;

  &:hover {
    background-color: white;
    box-shadow: ${Elevations['elevation--surface--interactive--hover']};
    transition: box-shadow 500ms ease;
  }

  && {
    height: auto;
    padding: 24px;
  }
`;

const StyledIconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background-color: ${Colors['surface--action--strong--default']};

  svg {
    color: white;

    path {
      fill: currentColor;
    }
  }
`;

const StyledMutedDescription = styled(Body).attrs({ level: 3 })`
  color: ${Colors['text-icon--muted']};
`;
