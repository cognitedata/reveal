import React from 'react';
import { action } from '@storybook/addon-actions';
import { ComponentStory } from '@storybook/react';
import { DocumentUploader } from './DocumentUploader';

export default {
  title: 'Files/FileUploader',
  component: DocumentUploader,
};

export const Example: ComponentStory<typeof DocumentUploader> = args => (
  <DocumentUploader {...args} />
);
Example.args = {
  onUploadSuccess: action('onUploadSuccess'),
  onUploadFailure: action('onUploadFailure'),
  onCancel: action('onCancel'),
  beforeUploadStart: action('beforeUploadStart'),
  onFileListChange: action('onFileListChange'),
};
