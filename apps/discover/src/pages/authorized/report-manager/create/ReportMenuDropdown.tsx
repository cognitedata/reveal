import React from 'react';

import { Button, Dropdown } from '@cognite/cogs.js';

import { CreateReportMenu } from './CreateReportMenu';

export const ReportMenuDropdown = () => {
  return (
    <Dropdown content={<CreateReportMenu />}>
      <Button
        key="CreateReportButton"
        type="ghost"
        aria-label="Create Report Button"
        icon="EllipsisVertical"
      />
    </Dropdown>
  );
};
