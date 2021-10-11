import { useSelector as useSelectorRedux } from 'react-redux';

import { StoreState } from 'core/types';

export default <TSelected, T = StoreState>(
  selector: (state: T) => TSelected,
  equalityFn?: (left: TSelected, right: TSelected) => boolean
) => {
  return useSelectorRedux<T, TSelected>(selector, equalityFn);
};
