import React from 'react';

export interface ComponentProps {
  propParam?: number;
}

interface ComponentState {
  stateParam?: string;
}

export class Component extends React.PureComponent<
  ComponentProps,
  ComponentState
  > {
  public render() {
    return <div>New component</div>;
  }
}
