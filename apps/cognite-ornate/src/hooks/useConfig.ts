import { FileFilterProps } from '@cognite/sdk';

type Config = {
  docsUrl: string;
  fileFilter: FileFilterProps;
};

const DEFAULT: Config = {
  docsUrl: '#',
  fileFilter: {
    mimeType: 'application/pdf',
  },
};

const VARENERGI: Config = {
  docsUrl: '#',
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
