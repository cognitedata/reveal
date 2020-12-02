import React from 'react';
import { Wrapper, ChildrenContainer } from './elements';

type Props = {
  title: string;
  children?: any;
};

const StatusCardHeader = ({ title, children }: Props) => {
  return (
    <Wrapper>
      <h2>{title}</h2>
      {children && <ChildrenContainer>{children}</ChildrenContainer>}
    </Wrapper>
  );
};

export default StatusCardHeader;
