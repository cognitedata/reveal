/* eslint-disable react/no-multi-comp */
import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';

import Provider from 'subApp/../../.storybook/boilerplate';
import { action } from '@storybook/addon-actions';
import UploadFiles from './UploadFiles';

storiesOf('subApp/vision|UploadFiles', module)
  .addDecorator((story) => <Provider story={story} />)
  .add('Base', () => {
    const [fileList, setFileList] = useState([]);
    return (
      <UploadFiles
        fileList={fileList}
        setFileList={setFileList}
        setChangesSaved={action('has changes')}
      />
    );
  });
