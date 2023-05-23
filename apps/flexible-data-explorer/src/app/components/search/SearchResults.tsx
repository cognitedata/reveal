import { Chip, Title } from '@cognite/cogs.js';
import { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { getIcon } from '../../utils/getIcon';

export const SearchResults = ({ children }: PropsWithChildren) => {
  return <Container>{children}</Container>;
};

const Header: React.FC<{ title: string }> = ({ title }) => {
  return (
    <HeaderContainer>
      <Chip icon={getIcon(title)} />
      <Title level={6}>{title}</Title>
    </HeaderContainer>
  );
};

SearchResults.Header = Header;

const Container = styled.div`
  background-color: white;

  border-radius: 10px;

  box-shadow: 0px 1px 8px rgba(79, 82, 104, 0.06),
    0px 1px 1px rgba(79, 82, 104, 0.1);
`;

const HeaderContainer = styled.div`
  display: flex;
  padding: 16px;
  gap: 16px;
  align-items: center;
`;
