import React, { CSSProperties } from 'react';
import Spin from 'antd/lib/spin';
import styled from 'styled-components';

const StyledSpinner = styled(Spin)`
  width: 100%;
  margin: 0 auto;
`;

const SpinWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin-top: 20px;

  div {
    align-self: center;
    margin: 0 auto;
  }
`;

type Props = {
  text?: string;
  className?: string;
  styles?: CSSProperties;
};

function Spinner({ text, ...rest }: Props) {
  return (
    <SpinWrapper {...rest}>
      <div>
        <StyledSpinner />
        <p>{text || 'Loading...'}</p>
      </div>
    </SpinWrapper>
  );
}

export default Spinner;
