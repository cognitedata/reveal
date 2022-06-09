/**
 * SourceTable Header StoryBook
 */

import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { Table } from './elements';
import { SourceTableHeader } from './SourceTableHeader';

export default {
  component: SourceTableHeader,
  title: 'Components/Source Table/Table Header',
} as Meta;

const Template: Story<ComponentProps<typeof SourceTableHeader>> = (args) => (
  <Table>
    <SourceTableHeader {...args} />
  </Table>
);

export const WorkspaceTableHeader = Template.bind({});
export const EditorTableHeader = Template.bind({});
export const FileTableHeader = Template.bind({});

WorkspaceTableHeader.args = { mode: 'workspace' };
EditorTableHeader.args = { mode: 'editor' };
FileTableHeader.args = { mode: 'file' };
