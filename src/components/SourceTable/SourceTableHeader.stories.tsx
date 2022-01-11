/**
 * SourceTable Header StoryBook
 */

import { Meta, Story } from '@storybook/react';
import { SourceTable, SourceTableWrapper } from 'pages/ChartView/elements';
import { SourceTableHeader, SourceTableHeaderProps } from './SourceTableHeader';

export default {
  component: SourceTableHeader,
  title: 'Components/Source Table Header',
} as Meta;

const Template: Story<SourceTableHeaderProps> = (args) => (
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
