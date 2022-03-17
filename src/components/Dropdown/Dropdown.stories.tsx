/**
 * Common Dropdown
 */

import { Button } from '@cognite/cogs.js';
import { Meta, Story } from '@storybook/react';
import React, { useState } from 'react';
import Dropdown from './Dropdown';

type Props = React.ComponentProps<typeof Dropdown>;
type UncontrolledProps = React.ComponentProps<typeof Dropdown.Uncontrolled>;

export default {
  component: Dropdown,
  title: 'Components/Common Dropdown',
} as Meta;

const ControlledTemplate: Story<Props> = (args) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  return (
    <>
      <h2>{args.title} Example</h2>
      <Dropdown {...args} open={isMenuOpen}>
        <Button
          icon="EllipsisHorizontal"
          type="ghost"
          aria-label="Open dropdown"
          onClick={() => setIsMenuOpen((prevState) => !prevState)}
        />
      </Dropdown>
    </>
  );
};

const UncontrolledTemplate: Story<UncontrolledProps> = (args) => (
  <>
    <h2>{args.title} Example</h2>
    <p>
      Trigger button can be customized as per{' '}
      <a
        href="https://cognitedata.github.io/cogs.js/?path=/docs/components-button--base"
        rel="noopener noreferrer nofollow"
        target="_blank"
      >
        Cogs.js
      </a>{' '}
      using <b>btnProps</b>
    </p>
    <Dropdown.Uncontrolled {...args} />
  </>
);

export const TimeseriesDropdown = ControlledTemplate.bind({});
export const WorkflowDropdown = ControlledTemplate.bind({});
export const ChartActions = ControlledTemplate.bind({});
export const ChartOwnerActions = ControlledTemplate.bind({});
export const DownloadDropdown = ControlledTemplate.bind({});
export const UncontrolledDropdown = UncontrolledTemplate.bind({});

TimeseriesDropdown.args = {
  title: 'Timeseries Dropdown',
  options: [
    {
      label: 'Threshold',
      icon: 'Threshold',
      onClick: () => {
        console.log('Threshold clicked');
      },
    },
    {
      label: 'Delete',
      icon: 'Delete',
      onClick: () => {
        console.log('Delete clicked');
      },
    },
  ],
};

WorkflowDropdown.args = {
  title: 'Workflow Dropdown',
  options: [
    {
      label: 'Edit calculation',
      icon: 'Function',
      onClick: () => {
        console.log('Edit clicked');
      },
    },
    {
      label: 'Duplicate',
      icon: 'Duplicate',
      onClick: () => {
        console.log('Duplicate clicked');
      },
    },
    {
      label: 'Threshold',
      icon: 'Threshold',
      onClick: () => {
        console.log('Threshold clicked');
      },
    },
    {
      label: 'Delete',
      icon: 'Delete',
      onClick: () => {
        console.log('Delete clicked');
      },
    },
  ],
};

ChartActions.args = {
  title: 'Readonly Chart Dropdown',
  options: [
    {
      label: 'Duplicate',
      icon: 'Duplicate',
      onClick: () => {
        console.log('Duplicate clicked');
      },
    },
  ],
};

ChartOwnerActions.args = {
  title: 'Chart Owners Dropdown',
  options: [
    {
      label: 'Rename',
      icon: 'Edit',
      onClick: () => {
        console.log('Edit clicked');
      },
    },
    {
      label: 'Delete',
      icon: 'Delete',
      onClick: () => {
        console.log('Delete clicked');
      },
    },
    {
      label: 'Duplicate',
      icon: 'Duplicate',
      onClick: () => {
        console.log('Duplicate clicked');
      },
    },
  ],
};

DownloadDropdown.args = {
  title: 'Download',
  open: true,
  options: [
    {
      label: 'PNG',
      icon: 'Image',
      onClick: () => {
        console.log('PNG Download');
      },
    },
    {
      label: 'CSV Download',
      icon: 'DataTable',
      onClick: () => {
        console.log('CSV Download clicked');
      },
    },
  ],
};

UncontrolledDropdown.args = {
  title: 'Uncontrolled Dropdown',
  btnProps: {
    type: 'primary',
    icon: 'Download',
    iconPlacement: 'right',
  },
  label: 'Download',
  options: [
    {
      label: 'Threshold',
      icon: 'Threshold',
      onClick: () => {
        console.log('Threshold clicked');
      },
    },
    {
      label: 'Delete',
      icon: 'Delete',
      onClick: () => {
        console.log('Delete clicked');
      },
    },
  ],
};
