import configureStory from 'storybook/configureStory';
import { Meta } from '@storybook/react';
import { ExtendedStory } from 'utils/test/storybook';
import exampleImage from 'images/applications/maintain_preview.jpg';
import { FileInfo } from '@cognite/sdk';
import { CdfClient } from 'utils';

import DocumentRow, { DocumentRowProps } from './DocumentRow';
import { DocumentRowWrapper } from './DocumentRowWrapper';

const meta: Meta<DocumentRowProps> = {
  title: 'Document / Document Row',
  component: DocumentRow,
  argTypes: {
    document: {
      name: 'Document',
      defaultValue: {
        id: 1,
        name: 'File name.png',
      } as FileInfo,
      control: {
        type: 'object',
      },
    },
  },
};

export default meta;

const Template: ExtendedStory<DocumentRowProps> = (args) => (
  <DocumentRowWrapper>
    <DocumentRow {...args} />
    <DocumentRow {...args} />
    <DocumentRow {...args} />
    <DocumentRow {...args} />
  </DocumentRowWrapper>
);

export const NormalRow = Template.bind({});
NormalRow.story = configureStory({});
