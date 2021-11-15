import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

export default <TSelected, T = RootState>(
  selector: (state: T) => TSelected,
  equalityFn?: (left: TSelected, right: TSelected) => boolean
) => {
  return useSelector<T, TSelected>(selector, equalityFn);
};
