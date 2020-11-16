import { useDispatch } from 'react-redux';
import { RootDispatch } from 'store';

export default () => {
  return useDispatch<RootDispatch>();
};
