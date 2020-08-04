import { useContext } from 'react';
import { Context } from './LoopDetector';

export const useLoopDetector = () => {
  const context = useContext(Context);
  return context;
};
