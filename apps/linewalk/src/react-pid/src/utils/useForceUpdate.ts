import { useState } from 'react';

const useForceUpdate = () => {
  const [, setState] = useState(0);
  return () => setState((state) => state + 1);
};

export default useForceUpdate;
