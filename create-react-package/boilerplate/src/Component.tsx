import React from 'react';

export interface ComponentProps {
  someInput?: number;
}

interface ComponentState {
  stateParam?: string;
}

// Alternatively, here's a boilerplate stateless functional component:
// const Component: React.SFC<ComponentProps> = ({ someInput }) => {
//   // TODO: Fill in more content.
//   return <div>Hello {someInput}</div>
// };

class Component extends React.PureComponent<ComponentProps, ComponentState> {
  public render() {
    const { someInput } = this.props;
    return <div>Hello {someInput}</div>;
  }
}

export default Component;
