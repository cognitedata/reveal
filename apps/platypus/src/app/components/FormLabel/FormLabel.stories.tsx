import React from 'react';

import { Story } from '@storybook/react';
import styled from 'styled-components/macro';

import { FormLabel } from './FormLabel';

const Wrapper = styled.div`
  padding: 50px;
`;

const FormLabelTemplate: Story<typeof FormLabel> = (_args: any) => (
  <FormLabel level={2} strong required>
    Form Label
  </FormLabel>
);

export default {
  title: 'Basic components/FormLabel',
  component: FormLabel,
  decorators: [
    (storyFn: () => React.ReactNode) => <Wrapper>{storyFn()}</Wrapper>,
  ],
};

export const FormLabelComponent = FormLabelTemplate.bind({});
FormLabelComponent.storyName = 'Form Label';
