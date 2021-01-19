import React from 'react';
import styled from 'styled-components';

const Line = styled.span`
  height: 1px;
  background-color: #d9d9d9;
  width: 100%;
`;

const OrWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 30px 0;
`;

const LoginOrWrapper: React.FC = () => {
  return (
    <OrWrapper>
      <Line />{' '}
      <p
        style={{
          margin: '0 20px',
          color: 'black',
          fontSize: 13,
          fontWeight: 'bold',
        }}
      >
        OR
      </p>{' '}
      <Line />
    </OrWrapper>
  );
};

export default LoginOrWrapper;
