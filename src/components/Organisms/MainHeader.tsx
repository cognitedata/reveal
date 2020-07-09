import React from 'react';
import styled from 'styled-components';
import Logo from '../Atoms/Logo';

const Header = styled.header`
  display: flex;
  justify-content: space-between;

  height: 56px;

  background-color: var(--cogs-white);
  border-bottom: 1px solid var(--cogs-greyscale-grey3);
`;

const HeaderItem = styled.div`
  display: flex;
  align-items: center;
`;

const Title = styled(HeaderItem)`
  border-right: 1px solid var(--cogs-greyscale-grey3);
  & > div:first-child {
    padding: 0 16px;
  }
  & > div:last-child {
    padding-right: 56px;
    h1 {
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
    }
    h2 {
      font-size: 12px;
      font-style: normal;
      font-weight: 500;
    }
  }
`;

const MainMenu = styled(HeaderItem)`
  flex-grow: 2;
`;

const AvatarContainer = styled(HeaderItem)``;

const ActionsContainer = styled(HeaderItem)``;

const MainHeader = (): React.ReactElement => {
  return (
    <Header>
      <Title>
        <div>
          <Logo />
        </div>
        <div>
          <h1>Discover</h1>
          <h2>Cognuit</h2>
        </div>
      </Title>
      <MainMenu>menu</MainMenu>
      <AvatarContainer>avatar</AvatarContainer>
      <ActionsContainer>actions</ActionsContainer>
    </Header>
  );
};

export default MainHeader;
