import React, { useCallback, useEffect, useRef, useState } from 'react';

import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';

import { BaseButton } from 'components/buttons';
import EmptyState from 'components/emptyState';
import { Table, TableResults, RowProps } from 'components/tablev3';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useCasingsForTable } from 'modules/wellSearch/selectors';

import CasingPreviewModal from './CasingPreviewModal';
import {
  CasingsTableWrapper,
  CasingViewButtonWrapper,
  EmptyStateWrapper,
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

const CASINGS_EMPTY_TITLE = 'We couldn’t find anything based on your search';
const CASINGS_EMPTY_SUB_TITLE = 'Please, change your search parameters';
const SCROLL_MARGIN = 15;

type Props = {
  searchPhrase: string;
  onReset: () => void;
};

export const CasingTableView: React.FC<Props> = ({ searchPhrase, onReset }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [buttonOffset, setButtonOffset] = useState<number>(0);

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

  const renderRowHoverComponent: React.FC<{
    row: RowProps;
  }> = ({ row }) => (
    <CasingViewButtonWrapper offset={buttonOffset}>
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

  const renderRowSubComponent = useCallback(
    ({ row }) => {
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
    },
    [buttonOffset]
  );

  // Trick to update hover button position
  const updateButtonOffset = () => {
    const scrollWidth = get(scrollRef, 'current.firstChild.scrollWidth', 0);
    const scrollLeft = get(scrollRef, 'current.firstChild.scrollLeft', 0);
    const offsetWidth = get(scrollRef, 'current.firstChild.offsetWidth', 0);
    const buttonOffset = scrollWidth - offsetWidth - scrollLeft + SCROLL_MARGIN;
    setButtonOffset(buttonOffset);
  };

  useEffect(() => {
    // Give some time to update scroll element reference
    setTimeout(() => {
      updateButtonOffset();
    }, 100);
    scrollRef.current?.firstChild?.addEventListener(
      'scroll',
      updateButtonOffset
    );
    window.addEventListener('resize', updateButtonOffset);
    return () => {
      scrollRef.current?.firstChild?.removeEventListener(
        'scroll',
        updateButtonOffset
      );
      window.removeEventListener('resize', updateButtonOffset);
    };
  }, [isEmpty(data)]);

  if (isLoading || isEmpty(data)) {
    return (
      <EmptyStateWrapper>
        <EmptyState
          isLoading={isLoading}
          emptyTitle={CASINGS_EMPTY_TITLE}
          emptySubtitle={CASINGS_EMPTY_SUB_TITLE}
        />
        <BaseButton
          type="primary"
          text="Reset to default"
          aria-label="View"
          onClick={onReset}
        />
      </EmptyStateWrapper>
    );
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
        <CasingPreviewModal
          onClose={handleDialogClosed}
          casing={formattedCasings[0]}
        />
      )}
    </>
  );
};

export default CasingTableView;
