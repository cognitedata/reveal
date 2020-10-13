import React from 'react';
import styled from 'styled-components';
import theme from 'styles/theme';
import Spin from 'antd/lib/spin';

interface CardProps {
  title?: string | JSX.Element;
  extra?: JSX.Element | JSX.Element[];
  children?: JSX.Element | JSX.Element[];
  footer?: JSX.Element | JSX.Element[];
  style?: object;
  headerStyle?: object;
  loading?: boolean;
}
const Wrapper = styled.div`
  box-shadow: 0px 8px 48px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
`;

const Header = styled.div`
  padding: 16px 56px;
  border-bottom: 2px solid ${theme.backgroundColor};
  display: flex;
  justify-content: space-between;
`;

const Title = styled.h3`
  color: ${theme.textColor};
  font-size: 16px;
  text-transform: uppercase;
  font-weight: bold;
  margin: 0;
`;

const Body = styled.div`
  flex-grow: 1;
`;

const Content = styled.div`
  padding: 18px 30px;
  height: 100%;
`;
const Footer = styled.div`
  padding: 16px 56px;
  border-top: 2px solid ${theme.backgroundColor};
`;
const Extra = styled.div`
  float: right;
`;

const Card = ({
  title,
  children,
  footer,
  extra,
  headerStyle,
  loading,
  ...rest
}: CardProps) => (
  <Wrapper {...rest}>
    {(title || extra) && (
      <Header style={headerStyle}>
        <Title>{title}</Title>
        {extra && <Extra>{extra}</Extra>}
      </Header>
    )}
    {!loading ? (
      <>
        <Body>
          <Content>{children}</Content>
        </Body>
        {footer && <Footer>{footer}</Footer>}
      </>
    ) : (
      <Spin style={{ marginTop: '20%' }} />
    )}
  </Wrapper>
);

export default Card;
