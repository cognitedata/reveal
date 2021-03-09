import React from 'react';
import { Sentry, Props } from './Sentry';

export default {
  title: 'Sentry',
};

export const Example = (props: Partial<Props>) => (
  <Sentry {...props}>
    <div>content</div>
  </Sentry>
);
