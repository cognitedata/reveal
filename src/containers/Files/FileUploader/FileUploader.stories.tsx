import React from 'react';
import { action } from '@storybook/addon-actions';
import { FileUploader } from './FileUploader';

export default {
  title: 'Files/FileUploader',
  component: FileUploader,
};

export const Example = args => <FileUploader {...args} />;
Example.args = {
  onUploadSuccess: action('onUploadSuccess'),
  onUploadFailure: action('onUploadFailure'),
  onCancel: action('onCancel'),
  beforeUploadStart: action('beforeUploadStart'),
  onFileListChange: action('onFileListChange'),
};
