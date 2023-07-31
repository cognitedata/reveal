import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import pickBy from 'lodash/pickBy';
import { toBooleanMap } from 'utils/booleanMap';

import { PreviewButton } from 'components/Buttons';
import EmptyState from 'components/EmptyState';
import { OKModal } from 'components/Modal';
import { RowProps, Table } from 'components/Tablev3';
import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';
import { inspectTabsActions } from 'modules/inspectTabs/actions';
import { useFilterDataLog } from 'modules/inspectTabs/selectors';

import { columns } from './columns';
import { PreviewButtonWrapper } from './elements';
import { useWellLogsData } from './hooks/useWellLogsData';
import { WellLogView } from './types';
import { WellLogsPreview } from './WellLogsPreview';

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

  const { data, isLoading } = useWellLogsData();

  useDeepEffect(() => {
    if (!data || !isEmpty(selectedIds)) {
      return;
    }

    const wellLogIds = map(data, 'id');
    const allSelectedWellLogsMap = toBooleanMap(wellLogIds, true);

    dispatch(inspectTabsActions.setSelectedLogIds(allSelectedWellLogsMap));
  }, [data]);

  const selectedWellLogs = useDeepMemo(
    () => data.filter((wellLog) => selectedIds[wellLog.id]),
    [data, selectedIds]
  );

  const handleRowSelect = (wellLogs: RowProps<WellLogView>, value: boolean) => {
    dispatch(
      inspectTabsActions.setSelectedLogIds({
        [wellLogs.original.id]: value,
      })
    );
  };

  const handleRowsSelect = (value: boolean) => {
    const ids = data.map(({ id }) => id);
    const selection = toBooleanMap(ids, value);
    dispatch(inspectTabsActions.setSelectedLogIds(selection));
  };

  if (isEmpty(data)) {
    return <EmptyState isLoading={isLoading} />;
  }

  return (
    <>
      <Table<WellLogView>
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

export default WellLogsTable; // for lazy loading
