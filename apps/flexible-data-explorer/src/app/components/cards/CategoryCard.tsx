import React from 'react';

import styled from 'styled-components';

import { Body, Button, Icon } from '@cognite/cogs.js';

import { useTranslation } from '../../hooks/useTranslation';
import { getIcon } from '../../utils/getIcon';

interface Props {
  type: string;
  description?: string;
  onClick?: (type: string) => void;
}

export const CategoryCard: React.FC<Props> = React.memo(
  ({ type, description, onClick }) => {
    const { t } = useTranslation();

    return (
      <Container>
        <Content>
          <Header>
            <Icon type={getIcon(type)} />
            <Body level={5} strong>
              {type}
            </Body>
          </Header>
          <Body level={4}>{description || t('GENERAL_NO_DESCRIPTION')}</Body>
        </Content>

        <Button
          type="ghost"
          icon="ArrowRight"
          aria-label="go to type"
          onClick={() => onClick?.(type)}
        />
      </Container>
    );
  }
);

const Container = styled.div`
  width: 100%;
  min-height: 100px;
  background-color: white;
  border-radius: 10px;
  padding: 16px;
  border: 1px solid rgba(83, 88, 127, 0.16);
  box-shadow: 0px 1px 8px rgba(79, 82, 104, 0.06),
    0px 1px 1px rgba(79, 82, 104, 0.1);

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

const Content = styled.div``;
