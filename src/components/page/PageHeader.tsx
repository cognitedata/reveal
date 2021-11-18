import { Body, Button, Detail, Flex, Title } from '@cognite/cogs.js';
import React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div<{ $marginBottom?: string }>`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ $marginBottom }) => $marginBottom || '1.5rem'};
`;

const Wrapper = styled.div`
  display: flex;
  flex: 0.95;
  .cogs-body-1,
  .cogs-body-2 {
    color: var(--cogs-text-color-secondary);
  }
`;

const Description = styled(Body).attrs({ level: 1, as: 'p' })`
  margin-top: 0.5rem;
  margin-bottom: 0%;
`;

const BackContainer = styled.div`
  margin-right: 0.5rem;
`;

interface Props {
  title: string;
  titleLevel?: number;
  marginBottom?: string;
  subtitle?: string;
  description?: string;
  showGoBack?: boolean;
  onClose?: () => void;
  Action?: JSX.Element[] | JSX.Element;
}
export const PageHeader: React.FC<Props> = React.memo(
  ({
    title,
    subtitle,
    marginBottom,
    description,
    Action,
    showGoBack,
    onClose,
    titleLevel = 3,
  }) => {
    const history = useHistory();

    const renderCloseAction = React.useMemo(() => {
      if (onClose) {
        return (
          <BackContainer>
            <Button
              type="ghost"
              icon="Close"
              aria-label="Go to previous page"
              onClick={onClose}
            />
          </BackContainer>
        );
      }

      if (showGoBack) {
        return (
          <BackContainer>
            <Button
              type="ghost"
              icon="ArrowBack"
              aria-label="Go to previous page"
              onClick={() => history.goBack()}
            />
          </BackContainer>
        );
      }

      return null;
    }, [showGoBack, onClose, history]);

    return (
      <Container $marginBottom={marginBottom}>
        <Wrapper>
          <Flex alignItems="flex-end">{renderCloseAction}</Flex>
          <div>
            {subtitle && <Detail strong>{subtitle}</Detail>}
            <Title level={titleLevel}>{title}</Title>
            {description && <Description>{description}</Description>}
          </div>
        </Wrapper>

        {Action && <div>{Action}</div>}
      </Container>
    );
  }
);
