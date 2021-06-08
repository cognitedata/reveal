import React, { useState } from 'react';
import { Button } from '@cognite/cogs.js';

import ErrorBoundary from './ErrorBoundary';

export default {
  title: 'ErrorBoundary',
};

export const WithChildren = () => {
  return (
    <ErrorBoundary instanceId="storybook">
      <h1>Must have children</h1>
    </ErrorBoundary>
  );
};

const Crasher = () => {
  const [crashing, setCrashing] = useState(false);
  if (crashing) {
    throw new Error('Bad error');
  }
  return (
    <Button type="danger" onClick={() => setCrashing(true)}>
      Crash
    </Button>
  );
};

export const WithErrorCaught = () => {
  return (
    <ErrorBoundary instanceId="storybook">
      <Crasher />
    </ErrorBoundary>
  );
};

export const DifferentLevels = () => {
  return (
    <ErrorBoundary instanceId="storybook">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div>
          <Crasher />
        </div>
        <div
          style={{
            flex: 1,
            padding: 20,
            margin: 20,
            outline: '2px solid #cdcdcd',
          }}
        >
          <ErrorBoundary instanceId="nested">
            <Crasher />
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
};
