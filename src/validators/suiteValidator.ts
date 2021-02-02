import { Validator } from './types';

export const suiteValidator: Validator = {
  title: {
    required: { message: 'Please, enter suite title' },
  },
  description: {
    validate: (value: string) =>
      value.length > 250 ? 'The description is too long' : '',
  },
};
