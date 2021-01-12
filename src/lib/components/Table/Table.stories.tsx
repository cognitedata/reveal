import React from 'react';
import { action } from '@storybook/addon-actions';
import { assets } from 'lib/stubs/assets';
import { Table } from './Table';
import { ResourceTableColumns } from './Columns';

export default { title: 'Component/Table', component: Table };
export const Example = () => (
  <div style={{ height: 300, width: '100%' }}>
    <Table
      onRowClick={action('onRowClick')}
      data={assets}
      activeIds={[assets[0].id]}
      previewingIds={[assets[1].id]}
      disabledIds={[assets[2].id]}
      columns={[ResourceTableColumns.name]}
    />
  </div>
);
