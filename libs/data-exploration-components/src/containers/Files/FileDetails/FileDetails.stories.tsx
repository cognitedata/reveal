import React from 'react';
import { files } from '@data-exploration-components/stubs/files';
import { FileDetails } from './FileDetails';

export default {
  title: 'Files/FileDetails',
  component: FileDetails,
};
export const Example = () => <FileDetails file={files[0]} />;
