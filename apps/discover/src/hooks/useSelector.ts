import { useSelector as useSelectorRedux } from 'react-redux';

import { StoreState } from 'core/types';

const useSelector = <TSelected, T = StoreState>(
  selector: (state: T) => TSelected,
  equalityFn?: (left: TSelected, right: TSelected) => boolean
) => {
  return useSelectorRedux<T, TSelected>(selector, equalityFn);
};

export default useSelector;
