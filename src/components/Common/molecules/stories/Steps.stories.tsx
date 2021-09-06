import React from 'react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { Steps } from '../StepsList/Steps';
import { StepsType } from '../StepsList/types';

export default { title: 'Molecules/Steps', decorator: withKnobs };

const steps: StepsType[] = [
  {
    path: undefined,
    title: ['Step 1'],
  },
  {
    path: undefined,
    title: ['Step 2'],
  },
  {
    path: undefined,
    title: ['Step 3'],
  },
  {
    path: undefined,
    title: ['Step 4'],
  },
  {
    path: undefined,
    title: ['Step 5'],
  },
];

export const Example = () => (
  <>
    <Steps small={boolean('Small size', false)} steps={steps} current={0} />
  </>
);
