import React, { Suspense } from 'react';
import '@cognite/cogs.js/dist/cogs.css';
import Metrics from '@cognite/metrics';
import './i18n';

// Stub out the entire Metrics class
// TODO(OI-1112): For fun sometime, make this a proper storybook addon!
// @ts-ignore
Metrics.create = () => ({
  track: () => {},
  start: () => ({ stop: () => {} }),
});
