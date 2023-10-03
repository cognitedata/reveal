import { ComponentProps } from 'react';
import { ReactFlowProvider } from 'react-flow-renderer';

import { Meta, Story } from '@storybook/react';

import { defaultTranslations } from '../../translations';
import EditorToolbar from '../EditorToolbar/EditorToolbar';

import EditorControls from './EditorControls';

export default {
  component: EditorControls,
  title: 'Components/Node Editor/v2/Editor Controls',
} as Meta;

const Template: Story<ComponentProps<typeof EditorControls>> = (args) => (
  // eslint-disable-next-line
  // @ts-ignore todo(DEGR-2397) react 18 has FC without children
  <ReactFlowProvider>
    <EditorControls {...args} />
  </ReactFlowProvider>
);

const HorizontalTemplate: Story<ComponentProps<typeof EditorControls>> = (
  args
) => (
  // eslint-disable-next-line
  // @ts-ignore todo(DEGR-2397) react 18 has FC without children
  <ReactFlowProvider>
    <EditorToolbar>
      <EditorControls {...args} />
    </EditorToolbar>
  </ReactFlowProvider>
);

export const AutoAlignOff = Template.bind({});
export const AutoAlignOn = Template.bind({});
export const ReadOnly = Template.bind({});
export const HorizontalControls = HorizontalTemplate.bind({});

AutoAlignOn.args = {
  settings: { autoAlign: true },
  translations: defaultTranslations,
};

AutoAlignOff.args = {
  settings: { autoAlign: false },
  translations: defaultTranslations,
};

ReadOnly.args = {
  settings: { autoAlign: false },
  translations: defaultTranslations,
  readOnly: true,
};

HorizontalControls.args = {
  settings: { autoAlign: false },
  translations: defaultTranslations,
  horizontal: true,
};
