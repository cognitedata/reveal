import React from 'react';
import { array } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { SDKProvider } from 'lib/context';
import { FileUploader } from './FileUploader';

export default {
  title: 'Files/FileUploader',
  component: FileUploader,
  decorators: [
    (storyFn: any) => <SDKProvider sdk={{}}>{storyFn()}</SDKProvider>,
  ],
};

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
