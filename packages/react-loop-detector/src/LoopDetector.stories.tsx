import React, { useState } from 'react';
import { action } from '@storybook/addon-actions';
import { number, text } from '@storybook/addon-knobs';
import { Button } from '@cognite/cogs.js';

import LoopDetector, { Props } from './LoopDetector';
import { useLoopDetector } from './hooks';

export default {
  title: 'LoopDetector',
};

const ClearButton = () => {
  const { onLoopExit } = useLoopDetector();
  return <Button onClick={onLoopExit}>Clear</Button>;
};

const StatusText = () => {
  const { records } = useLoopDetector();
  return (
    <div>
      <div>Record count: {records.length}</div>
      <pre>{JSON.stringify(records, null, 2)}</pre>
    </div>
  );
};

export const Example = (props: Partial<Props>) => {
  const [key, setKey] = useState(() => Date.now());

  return (
    <LoopDetector
      key={key}
      loopThresholdCount={number('Loop threshold count', 10)}
      loopWindowMillis={number('Loop window millis', 60 * 1000)}
      storageKey={text('Storage key', 'storybook-key')}
      onLoopDetected={action('onLoopDetected')}
      {...props}
    >
      <Button
        onClick={() => {
          setKey(Date.now());
        }}
      >
        Remount
      </Button>
      <ClearButton />
      <hr />
      <StatusText />
    </LoopDetector>
  );
};
