import isEmpty from 'lodash/isEmpty';
import { DEFAULT_LINE_NAME } from '../constants';

export const getLineName = (name: string | undefined, index: number) => {
  if (name && !isEmpty(name)) {
    return name;
  }

  return `${DEFAULT_LINE_NAME} ${index + 1}`;
};
