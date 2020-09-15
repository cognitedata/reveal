import React, { useState } from 'react';
import { Button } from '@cognite/cogs.js';
import DetailView from './DetailView';

// noinspection JSUnusedGlobalSymbols
export default {
  title: 'DetailView',
};

const mockObj = {
  id: 1,
  source: {
    name: 'SourceName',
    externalId: undefined,
    crs: undefined,
    dataType: undefined,
    createdTime: undefined,
    repository: undefined,
    businessTag: undefined,
    revision: undefined,
  },
  targets: [
    {
      name: 'TranslationName',
      owId: undefined,
      crs: undefined,
      dataType: undefined,
      createdTime: undefined,
      repository: undefined,
      configTag: undefined,
      revision: undefined,
      interpreter: undefined,
    },
  ],
};

// noinspection JSUnusedGlobalSymbols
export const Base = () => {
  const [showing, setShowing] = useState(false);
  function hide() {
    setShowing(false);
  }
  function toggle() {
    setShowing((prev) => !prev);
  }
  return (
    <>
      <div
        style={{
          margin: '32px 0 32px 32px',
          position: 'relative',
          height: '700px',
        }}
      >
        <DetailView onClose={hide} data={mockObj} />
      </div>
      <Button type="primary" onClick={toggle}>
        Toggle Detail View
      </Button>
    </>
  );
};
