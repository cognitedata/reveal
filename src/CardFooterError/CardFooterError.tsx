import React from 'react';
import { Icon } from 'antd';
import { Centered } from 'elements';

import styled from 'styled-components';
import { StyledCardFooterError } from './elements';

type Props = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

const VerticalAligned = styled.div``;

const CardFooterError = ({ children, style }: Props) => {
  return (
    <StyledCardFooterError style={style}>
      <div className="color-overlay" />
      <Centered style={{ padding: '0 16px' }}>
        <Icon type="warning" style={{ fontSize: '14px' }} />
      </Centered>
      <VerticalAligned>
        <div className="message">{children}</div>
      </VerticalAligned>
    </StyledCardFooterError>
  );
};

export default React.memo(CardFooterError);
