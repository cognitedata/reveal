import { Validator } from './types';

export const suiteValidator: Validator = {
  title: {
    required: { message: 'Please, enter suite title' },
  },
  description: {
    validate: (value: string) =>
      value.length > 250 ? 'The description is too long' : '',
  },
  imageFileId: {
    maxSize: { message: 'This image is too big. Please upload one under 1Mb' },
    mimeType: { message: 'For now we only allow .jpeg, .png and .svg' },
  },
};
