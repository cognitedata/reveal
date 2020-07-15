import React, { useState } from 'react';
import { Button } from '@cognite/cogs.js';
import DetailView from './DetailView';

// noinspection JSUnusedGlobalSymbols
export default {
  title: 'DetailView',
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
        <DetailView showing={showing} onClose={hide} />
      </div>
      <Button type="primary" onClick={toggle}>
        Toggle Detail View
      </Button>
    </>
  );
};
