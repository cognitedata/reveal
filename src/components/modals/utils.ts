import { key } from 'utils/generateKey';
import { Suite } from 'store/suites/types';

export const suiteEmpty: Suite = {
  key: key(),
  title: '',
  description: '',
  color: '',
  boards: [],
};
