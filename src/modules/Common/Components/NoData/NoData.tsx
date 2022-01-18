import { Graphic } from '@cognite/cogs.js';
import React from 'react';

export const NoData = () => (
  <div className="cogs-table no-data" style={{ height: '100%' }}>
    <Graphic type="Search" />
    No data found.
  </div>
);
