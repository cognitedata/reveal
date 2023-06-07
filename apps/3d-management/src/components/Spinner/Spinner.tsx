import React, { CSSProperties } from 'react';
import { Spin, SpinProps } from 'antd';
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
  visibleAfterMs?: number;
  text?: string;
  className?: string;
  style?: CSSProperties;
  size?: SpinProps['size'];
};

function Spinner({ text, size, visibleAfterMs = 200, ...rest }: Props) {
  const [isVisible, setIsVisible] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, visibleAfterMs);
    return () => {
      clearTimeout(timer);
    };
  }, [visibleAfterMs]);
  if (!isVisible) {
    return null;
  }

  return (
    <SpinWrapper {...rest}>
      <div>
        <StyledSpinner size={size} />
        <p>{text || 'Loading...'}</p>
      </div>
    </SpinWrapper>
  );
}

export default Spinner;
