import React from 'react';
import { files } from 'stubs/files';
import { MimeTypeFilter } from './MimeTypeFilter';

export default {
  title: 'Search Results/Filters/Files/MimeTypeFilter',
  component: MimeTypeFilter,
};
export const Example = () => <MimeTypeFilter items={files} />;
