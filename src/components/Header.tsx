import { Body, Button, Detail, Flex, Title } from '@cognite/cogs.js';
import React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.25rem;
`;
const Wrapper = styled.div`
  display: flex;
  gap: 0.5rem;
  flex: 0.95;
`;

interface Props {
  title: string;
  titleLevel?: number;
  subtitle?: string;
  description?: string;
  showGoBack?: boolean;
  onClose?: () => void;
  Action?: JSX.Element[] | JSX.Element;
}
export const Header: React.FC<Props> = React.memo(
  ({
    title,
    subtitle,
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
          <div>
            <Button
              type="ghost"
              icon="Close"
              aria-label="Go to previous page"
              onClick={onClose}
            />
          </div>
        );
      }

      if (showGoBack) {
        return (
          <div>
            <Button
              type="ghost"
              icon="ArrowBack"
              aria-label="Go to previous page"
              onClick={() => history.goBack()}
            />
          </div>
        );
      }

      return null;
    }, [showGoBack, onClose, history]);

    return (
      <Container>
        <Wrapper>
          <Flex alignItems="flex-end">{renderCloseAction}</Flex>
          <div>
            {subtitle && <Detail strong>{subtitle}</Detail>}
            <Title level={titleLevel}>{title}</Title>
            {description && (
              <Body as="p" level={1} style={{ marginTop: '0.5rem' }}>
                {description}
              </Body>
            )}
          </div>
        </Wrapper>

        {Action && <div>{Action}</div>}
      </Container>
    );
  }
);
