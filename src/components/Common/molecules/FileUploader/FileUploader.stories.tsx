import React from 'react';
import { array } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { FileUploader } from './FileUploader';

export default { title: 'Molecules/FileUploader', component: FileUploader };

export const Example = () => {
  return (
    <FileUploader
      validExtensions={array('validExtensions', [])}
      onUploadSuccess={action('onUploadSuccess')}
      onUploadFailure={action('onUploadFailure')}
      onCancel={action('onCancel')}
      beforeUploadStart={action('beforeUploadStart')}
      onFileListChange={action('onFileListChange')}
    />
  );
};
