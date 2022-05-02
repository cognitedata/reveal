import React, { useCallback, useRef, useState } from 'react';

import groupBy from 'lodash/groupBy';
import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';

import { BaseButton } from 'components/Buttons';
import EmptyState from 'components/EmptyState';
import { NO_RESULTS_TEXT } from 'components/EmptyState/constants';
import { Table, TableResults, RowProps } from 'components/Tablev3';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useCasingsForTable } from 'modules/wellSearch/selectors';

import { CasingPreviewFullscreen } from './CasingPreviewFullscreen';
import { SideModes } from './CasingView/types';
import {
  CasingsTableWrapper,
  CasingViewButtonWrapper,
  GroupedCasingsTableWrapper,
} from './elements';
import { getFortmattedCasingData } from './helper';
import { useGetCasingTableColumns } from './hooks/useHelpers';
import { FormattedCasings, CasingData, GroupedCasingData } from './interfaces';

const wellsTableOptions = {
  expandable: true,
  flex: false,
  hideScrollbars: true,
};

type Props = {
  searchPhrase: string;
  sideMode: SideModes;
};

export const CasingTableView: React.FC<Props> = ({
  searchPhrase,
  sideMode,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [formattedCasings, setFormattedCasings] = useState<FormattedCasings[]>(
    []
  );

  const { data: preferredUnit } = useUserPreferencesMeasurement();
  const { wellsTableColumns, casingsTableColumn } = useGetCasingTableColumns();

  const { casings, isLoading } = useCasingsForTable();

  const data = casings.filter(
    (casing) =>
      !searchPhrase ||
      casing.wellName.includes(searchPhrase) ||
      casing.wellboreName.includes(searchPhrase)
  );

  const onPreview = (casing: CasingData) => {
    setFormattedCasings(getFortmattedCasingData([casing], preferredUnit));
  };

  const handleDialogClosed = () => {
    setFormattedCasings([]);
  };

  if (!isEmpty(data)) {
    casingsTableColumn.forEach((column) => {
      switch (column.accessor) {
        case 'odMin':
          column.Header = `OD Min (${head(data)?.odUnit})`; // eslint-disable-line no-param-reassign
          break;
        case 'odMax':
          column.Header = `OD Max (${head(data)?.odUnit})`; // eslint-disable-line no-param-reassign
          break;
        case 'idMin':
          column.Header = `ID Min (${head(data)?.idUnit})`; // eslint-disable-line no-param-reassign
          break;
      }
    });
  }
  const groupedCasingData = Object.entries(groupBy(data, 'wellName')).map(
    ([wellName, casings], id) => ({ id, wellName, casings })
  );

  const [expandedIds, setExpandedIds] = useState<TableResults>(
    groupedCasingData.reduce((prev, cur) => ({ ...prev, [cur.id]: true }), {})
  );

  const handleRowClick = useCallback(
    (row: RowProps & { isSelected: boolean }) => {
      const wellRow = row.original as GroupedCasingData;
      setExpandedIds((state) => ({
        ...state,
        [wellRow.id]: !state[wellRow.id],
      }));
    },
    []
  );

  const renderRowHoverComponent = ({ row }: { row: RowProps }) => (
    <CasingViewButtonWrapper>
      <BaseButton
        type="primary"
        text="Show casings"
        aria-label="View"
        onClick={() => {
          onPreview(row.original as CasingData);
        }}
      />
    </CasingViewButtonWrapper>
  );

  const renderRowSubComponent = useCallback(({ row }) => {
    return (
      <CasingsTableWrapper>
        <Table<CasingData>
          id="well-casings-table"
          scrollTable={false}
          data={row.original.casings}
          columns={casingsTableColumn}
          renderRowHoverComponent={renderRowHoverComponent}
          hideHeaders
        />
      </CasingsTableWrapper>
    );
  }, []);

  if (isLoading || isEmpty(data)) {
    return <EmptyState isLoading={isLoading} emptyTitle={NO_RESULTS_TEXT} />;
  }

  return (
    <>
      <GroupedCasingsTableWrapper ref={scrollRef}>
        <Table<GroupedCasingData>
          id="grouped-casing-data"
          scrollTable={false}
          data={groupedCasingData}
          columns={wellsTableColumns}
          options={wellsTableOptions}
          expandedIds={expandedIds}
          handleRowClick={handleRowClick}
          renderRowSubComponent={renderRowSubComponent}
        />
      </GroupedCasingsTableWrapper>

      {!isEmpty(formattedCasings) && (
        <CasingPreviewFullscreen
          onClose={handleDialogClosed}
          casing={formattedCasings[0]}
          sideMode={sideMode}
        />
      )}
    </>
  );
};

export default CasingTableView;
