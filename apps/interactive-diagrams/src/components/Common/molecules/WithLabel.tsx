import React from 'react';

import { SmallTitle } from '@interactive-diagrams-app/components/Common';

type Props = {
  title: string;
  children: React.ReactNode;
};
export const WithLabel = (props: Props) => {
  return (
    <div style={{ width: '100%' }}>
      <SmallTitle>{props.title}</SmallTitle>
      {props.children}
    </div>
  );
};
