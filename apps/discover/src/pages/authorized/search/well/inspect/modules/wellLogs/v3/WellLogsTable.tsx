import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import pickBy from 'lodash/pickBy';

import { PreviewButton } from 'components/buttons';
import EmptyState from 'components/emptyState';
import { Loading } from 'components/loading/Loading';
import { OKModal } from 'components/modal';
import { RowProps, Table } from 'components/tablev3';
import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';
import { inspectTabsActions } from 'modules/inspectTabs/actions';
import { useFilterDataLog } from 'modules/inspectTabs/selectors';
import { useSelectedWellboreLogs } from 'modules/wellInspect/hooks/useWellLogsQuerySelectors';
import { toBooleanMap } from 'modules/wellSearch/utils';

import { COMMON_COLUMN_WIDTHS } from '../../../constants';

import { PreviewButtonWrapper } from './elements';
import { WellLog } from './types';
import { WellLogsPreview } from './WellLogsPreview';

const columns = [
  {
    Header: 'Well',
    accessor: 'wellName',
    width: COMMON_COLUMN_WIDTHS.WELL_NAME,
    maxWidth: '0.5fr',
  },
  {
    Header: 'Wellbore',
    accessor: 'wellboreName',
    width: COMMON_COLUMN_WIDTHS.WELLBORE_NAME,
    maxWidth: '0.3fr',
  },
  {
    Header: 'Log Name',
    accessor: 'id',
    width: '140px',
    maxWidth: '0.3fr',
  },
  {
    Header: 'Source',
    accessor: 'source.sourceName',
    width: '140px',
  },
  {
    Header: 'Modified',
    accessor: 'modified',
    width: '140px',
  },
];

const tableOptions = {
  checkable: true,
  height: '100%',
  hideScrollbars: true,
  flex: false,
};

export const WellLogsTable: React.FC = () => {
  const [isLogsPreviewOpen, setLogsPreviewOpen] = useState<boolean>(false);
  const { selectedIds } = useFilterDataLog();
  const dispatch = useDispatch();

  const { data, isLoading } = useSelectedWellboreLogs();

  useDeepEffect(() => {
    if (!data || !isEmpty(selectedIds)) return;

    const wellLogIds = map(data, 'id');
    const allSelectedWellLogsMap = toBooleanMap(wellLogIds, true);

    dispatch(inspectTabsActions.setSelectedLogIds(allSelectedWellLogsMap));
  }, [data]);

  const selectedWellLogs = useDeepMemo(
    () => data.filter((wellLog) => selectedIds[wellLog.id]),
    [data, selectedIds]
  );

  const handleRowSelect = (wellLogs: RowProps<WellLog>, value: boolean) => {
    dispatch(
      inspectTabsActions.setSelectedLogIds({
        [wellLogs.original.id]: value,
      })
    );
  };

  const handleRowsSelect = (value: boolean) => {
    const ids: { [key: string]: boolean } = {};
    data.forEach((row) => {
      ids[row.id] = value;
    });
    dispatch(inspectTabsActions.setSelectedLogIds(ids));
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isEmpty(data)) {
    return <EmptyState />;
  }

  return (
    <>
      <Table<WellLog>
        scrollTable
        id="well-logs-table"
        data={data}
        columns={columns}
        options={tableOptions}
        selectedIds={selectedIds}
        handleRowSelect={handleRowSelect}
        handleRowsSelect={handleRowsSelect}
      />

      <PreviewButtonWrapper>
        <PreviewButton
          type="primary"
          onClick={() => setLogsPreviewOpen(true)}
          id="preview-button"
          disabled={isEmpty(pickBy(selectedIds))}
          data-testid="preview-button"
        />
      </PreviewButtonWrapper>

      <OKModal
        fullWidth
        visible={isLogsPreviewOpen}
        onOk={() => setLogsPreviewOpen(false)}
        onCancel={() => setLogsPreviewOpen(false)}
      >
        <WellLogsPreview wellLogs={selectedWellLogs} />
      </OKModal>
    </>
  );
};
