import React from 'react';

const useForceUpdate = () => {
  const [, setState] = React.useState(0);
  return () => setState((state) => state + 1);
};

export default useForceUpdate;
