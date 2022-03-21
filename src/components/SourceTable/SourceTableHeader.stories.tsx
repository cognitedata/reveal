/**
 * SourceTable Header StoryBook
 */

import { Meta, Story } from '@storybook/react';
import { SourceTable, SourceTableWrapper } from 'pages/ChartView/elements';
import { ComponentProps } from 'react';
import { SourceTableHeader } from './SourceTableHeader';

export default {
  component: SourceTableHeader,
  title: 'Components/Source Table/Table Header',
} as Meta;

const Template: Story<ComponentProps<typeof SourceTableHeader>> = (args) => (
  <SourceTableWrapper>
    <SourceTable>
      <SourceTableHeader {...args} />
    </SourceTable>
  </SourceTableWrapper>
);

export const WorkspaceTableHeader = Template.bind({});
export const EditorTableHeader = Template.bind({});
export const FileTableHeader = Template.bind({});

WorkspaceTableHeader.args = { mode: 'workspace' };
EditorTableHeader.args = { mode: 'editor' };
FileTableHeader.args = { mode: 'file' };
