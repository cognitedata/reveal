import { useContext } from 'react';
import { CDFExplorerContext } from 'providers/CDFExplorerProvider';

export default () => {
  if (!CDFExplorerContext) {
    throw new Error('CDFExplorerContext not defined');
  }
  return useContext(CDFExplorerContext);
};
