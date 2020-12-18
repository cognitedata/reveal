import { key } from '_helpers/generateKey';
import { Suite } from 'store/suites/types';

export const suiteEmpty: Suite = {
  key: key(),
  title: '',
  description: '',
  color: '#F4DAF8',
  boards: [],
};
