import React from 'react';
import styled from 'styled-components';
import theme from 'styles/theme';
interface NewHeaderProps {
  title: string | JSX.Element;
  ornamentColor?: string;
}

const NewHeader = ({ title, ornamentColor }: NewHeaderProps) => {
  return (
    <HeaderContainer>
      <Title>{title}</Title>
      <TitleOrnament
        style={{
          backgroundColor: ornamentColor || theme.titleOrnamentColor,
        }}
      />
    </HeaderContainer>
  );
};

const HeaderContainer = styled.div`
  margin-bottom: 22px;
  display: inline-block;
`;

const Title = styled.h5`
  color: black;
  margin-bottom: 0;
  display: inline;
  font-size: 24px;
  padding-right: 30px;
`;

const TitleOrnament = styled.div`
  width: 80px;
  height: 6px;
  display: flex;
`;

export default NewHeader;
