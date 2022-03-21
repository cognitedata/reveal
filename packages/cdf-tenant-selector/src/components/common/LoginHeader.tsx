import React from 'react';
import styled from 'styled-components';

interface LoginHeaderProps {
  appName: string;
}

const LoginHeader = ({ appName }: LoginHeaderProps) => {
  return (
    <div>
      <LoginText>Sign in to</LoginText>
      <AppName className="name">{appName}</AppName>
      <CogniteMark color="black" />
    </div>
  );
};

const LoginText = styled.div`
  font-weight: 700;
  line-height: 24px;
  font-size: 12px;
  text-transform: uppercase;
  color: var(--cogs-greyscale-grey10);
`;

const AppName = styled.div`
  color: #000000;
  margin-top: 6px;
  font-size: 24px;
  line-height: 32px;
  font-weight: bold;
  letter-spacing: -0.01em;
  margin: 4px 0px 12px 0px;
`;

export const CogniteMark = styled.div<{ color: string }>`
  width: 18px;
  height: 4px;
  background: ${(props) => props.color};
`;

export default LoginHeader;
