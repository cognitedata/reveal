import React from 'react';
import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

import { Centered } from '../../styles/elements';
import { StyledError } from './elements';

type Props = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

const VerticalAligned = styled.div``;

const Error = ({ children, style }: Props) => {
  return (
    <StyledError style={style}>
      <div className="color-overlay" />
      <Centered style={{ padding: '0 16px' }}>
        <Icon type="Warning" style={{ fontSize: '14px' }} />
      </Centered>
      <VerticalAligned>
        <div className="message">{children}</div>
      </VerticalAligned>
    </StyledError>
  );
};

export default React.memo(Error);
