import React, { useState } from 'react';
import { Button } from '@cognite/cogs.js';
import { action } from '@storybook/addon-actions';
import { FileUploaderModal } from './FileUploaderModal';

export default {
  title: 'Files/FileUploaderModal',
  component: FileUploaderModal,
};

export const Example = () => {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Button onClick={() => setVisible(true)}>Toggle</Button>
      <FileUploaderModal
        visible={visible}
        onCancel={() => setVisible(false)}
        onFileSelected={action('selected file')}
      />
    </>
  );
};
