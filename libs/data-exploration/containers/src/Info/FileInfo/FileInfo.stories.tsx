import { fileMockData } from '@data-exploration-lib/core';
import React from 'react';

import { FileInfo } from './FileInfo';

export default {
  title: 'Files/FileInfo',
  component: FileInfo,
};
export const Example = () => <FileInfo file={fileMockData[0]} />;
