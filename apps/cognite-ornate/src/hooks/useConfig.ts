import { FileFilterProps } from '@cognite/sdk';

type Config = {
  fileFilter: FileFilterProps;
};

const DEFAULT: Config = {
  fileFilter: {
    mimeType: 'application/pdf',
  },
};

const VARENERGI: Config = {
  fileFilter: {
    mimeType: 'application/pdf',
    metadata: {
      DOCTYPE: 'XB',
    },
  },
};

export default (project?: string) => {
  switch (project) {
    case 'varenergi':
      return VARENERGI;
    default:
      return DEFAULT;
  }
};
