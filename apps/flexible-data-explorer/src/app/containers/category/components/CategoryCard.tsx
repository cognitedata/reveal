import React from 'react';

import styled from 'styled-components';

import { Body, Icon } from '@cognite/cogs.js';

import { CategoryChip } from '../../../components/chips/CategoryChip';
import { useTranslation } from '../../../hooks/useTranslation';
import { getIcon } from '../../../utils/getIcon';

interface Props {
  type: string;
  description?: string;
  onClick?: (type: string) => void;
}

export const CategoryCard: React.FC<Props> = React.memo(
  ({ type, description, onClick }) => {
    const { t } = useTranslation();

    return (
      <Container onClick={() => onClick?.(type)}>
        <Header>
          <CategoryChip icon={getIcon(type)} />
        </Header>

        <Content>
          <TextContainer>
            <Title>{type}</Title>
            <Description>
              {description || t('GENERAL_NO_DESCRIPTION')}
            </Description>
          </TextContainer>

          <ArrowRight />
        </Content>
      </Container>
    );
  }
);

const Container = styled.div.attrs({ role: 'button' })`
  min-height: 100px;
  background-color: white;
  border-radius: 10px;
  padding: 16px;
  outline: 1px solid rgba(83, 88, 127, 0.16);
  transition: box-shadow 0.2s ease-in-out;
  cursor: pointer;
  flex-direction: column;

  &:hover {
    box-shadow: 0px 1px 8px rgba(79, 82, 104, 0.06),
      0px 1px 1px rgba(79, 82, 104, 0.1);
  }

  display: flex;
  justify-content: space-between;

  gap: 8px;
`;

const Header = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  padding-bottom: 8px;
`;

const Content = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  width: 100%;
`;

const TextContainer = styled.div`
  width: 80%;
`;

const Title = styled(Body).attrs({ level: 5 })`
  font-weight: 600;
`;

const Description = styled(Body).attrs({ level: 4 })`
  white-space: nowrap;
  display: block;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const ArrowRight = styled(Icon).attrs({ type: 'ArrowRight' })`
  min-width: 16px;
`;
