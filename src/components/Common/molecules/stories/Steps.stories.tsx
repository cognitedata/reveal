import React from 'react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { Steps, StepsType } from '../Steps';

export default { title: 'Molecules/Steps', decorator: withKnobs };

const steps: StepsType[] = [
  {
    path: undefined,
    breadcrumbs: ['Step 1'],
  },
  {
    path: undefined,
    breadcrumbs: ['Step 2'],
  },
  {
    path: undefined,
    breadcrumbs: ['Step 3'],
  },
  {
    path: undefined,
    breadcrumbs: ['Step 4'],
  },
  {
    path: undefined,
    breadcrumbs: ['Step 5'],
  },
];

export const Example = () => (
  <>
    <Steps small={boolean('Small size', false)} steps={steps} current={0} />
  </>
);
