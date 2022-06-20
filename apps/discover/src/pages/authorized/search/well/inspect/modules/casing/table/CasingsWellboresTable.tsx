import React from 'react';

import { ViewButton } from 'components/Buttons';
import { RowProps, Table } from 'components/Tablev3';

import { CasingAssemblyTableView } from '../types';

import { useCasingsWellboresTableColumns } from './columns/useCasingsTableColumns';
import { CasingViewButtonWrapper } from './elements';

interface CasingsWellboresTableProps {
  data: CasingAssemblyTableView[];
  onPreviewClick: (wellboreName: string) => void;
}

const tableOptions = {
  flex: false,
  pagination: {
    enabled: true,
    pageSize: 50,
  },
};

export const CasingsWellboresTable: React.FC<CasingsWellboresTableProps> = ({
  data,
  onPreviewClick,
}) => {
  const columns = useCasingsWellboresTableColumns();

  const renderRowHoverComponent = ({
    row,
  }: {
    row: RowProps<CasingAssemblyTableView>;
  }) => (
    <CasingViewButtonWrapper>
      <ViewButton
        hideIcon
        text="Show casings"
        onClick={() => onPreviewClick(row.original.wellboreName)}
      />
    </CasingViewButtonWrapper>
  );

  return (
    <Table<Partial<CasingAssemblyTableView>>
      scrollTable
      indent
      hideHeaders
      id="wellbore-casings-table"
      data={data}
      columns={columns}
      options={tableOptions}
      renderRowHoverComponent={renderRowHoverComponent}
    />
  );
};
