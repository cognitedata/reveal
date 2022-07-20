import React from 'react';

import isEmpty from 'lodash/isEmpty';

import { ViewButton } from 'components/Buttons';
import { RowProps, Table } from 'components/Tablev3';
import { Center, FullWidth } from 'styles/layout';

import { CasingAssemblyTableView } from '../Table/types';

import { useCasingsWellboresTableColumns } from './columns/useCasingsTableColumns';
import { NO_CASINGS_DATA_TEXT } from './constants';
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

  if (isEmpty(data)) {
    return (
      <FullWidth>
        <Center>{NO_CASINGS_DATA_TEXT}</Center>
      </FullWidth>
    );
  }

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
