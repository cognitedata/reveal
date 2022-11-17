import React, { useState } from 'react';
import { Button } from '@cognite/cogs.js';
import { action } from '@storybook/addon-actions';
import { DocumentUploaderModal } from './DocumentUploaderModal';

export default {
  title: 'Files/FileUploaderModal',
  component: DocumentUploaderModal,
};

export const Example = () => {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Button onClick={() => setVisible(true)}>Toggle</Button>
      <DocumentUploaderModal
        visible={visible}
        onCancel={() => setVisible(false)}
        onFileSelected={action('selected file')}
      />
    </>
  );
};
