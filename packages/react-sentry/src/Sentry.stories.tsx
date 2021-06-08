import React from 'react';
import { Sentry } from './Sentry';
import type { SentryProps } from './utils';

export default {
  title: 'Sentry',
};

export const Example = (props: Partial<SentryProps>) => (
  <Sentry {...props}>
    <div>content</div>
  </Sentry>
);
