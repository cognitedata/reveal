import React from 'react';
import { Icon, Collapse } from '@cognite/cogs.js';

import { Centered, StyledError, StyledContainer } from './elements';

type Props = {
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

const ErrorExpandable = ({ children, style, title }: Props) => (
  <StyledError style={style}>
    <div className="color-overlay" />
    <Centered style={{ padding: '0 16px' }}>
      <Icon type="Warning" style={{ fontSize: '14px' }} />
    </Centered>
    <StyledContainer>
      <Collapse accordion>
        <Collapse.Panel header={title}>{children}</Collapse.Panel>
      </Collapse>
    </StyledContainer>
  </StyledError>
);

export default React.memo(ErrorExpandable);
