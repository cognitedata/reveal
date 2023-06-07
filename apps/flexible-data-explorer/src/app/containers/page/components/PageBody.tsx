import { PropsWithChildren } from 'react';

import styled from 'styled-components';

import { Skeleton } from '@cognite/cogs.js';

import { useUserSettings } from '../../../hooks/useUserSettings';

interface Props {
  loading?: boolean;
}

export const PageBody: React.FC<PropsWithChildren<Props>> = ({
  children,
  loading,
}) => {
  const { compact } = useUserSettings();

  return (
    <Container>
      <Content compact={compact}>
        {loading ? <Skeleton.List lines={10} /> : <>{children}</>}
      </Content>
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  /* overflow: auto; */
  /* position: relative; */
`;

const Content = styled.div<{ compact?: boolean }>`
  ${(props) => (props.compact ? `max-width: 1024px;` : '')}
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  /* overflow: auto; */
  /* padding-bottom: 16px; */
`;
