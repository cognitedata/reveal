import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { Loading } from 'components/loading/Loading';
import { Modal } from 'components/modal';
import { RowProps, Table } from 'components/tablev3';
import { showErrorMessage } from 'components/toast';
import { useDeepMemo } from 'hooks/useDeep';
import { filterDataActions } from 'modules/filterData/actions';
import { useFilterDataLog } from 'modules/filterData/selectors';
import { useSelectedWellboreLogs } from 'modules/wellInspect/hooks/useWellLogsQuerySelectors';

import {
  COMMON_COLUMN_WIDTHS,
  NO_LOGS_ERROR_MESSAGE,
} from '../../../constants';
import PreviewSelector from '../../common/PreviewSelector';

import { LogTypeViewer } from './LogTypeViewer';
import { WellLog } from './types';

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

export const LogType: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [wellLogs, setWellLogsData] = useState<WellLog[]>([]);
  const { selectedIds } = useFilterDataLog();
  const dispatch = useDispatch();
  const { t } = useTranslation('WellData');

  const { data, isLoading } = useSelectedWellboreLogs();

  const customSelectedIds = useDeepMemo(() => {
    const tempSelectedIds = { ...selectedIds };
    /**
     * Set undefined id mappings to true to set checked newly selected wells logs.
     * This way initially all the logs will be selected.
     */
    data.forEach((row) => {
      if (tempSelectedIds[row.id] === undefined) {
        tempSelectedIds[row.id] = true;
      }
    });
    return tempSelectedIds;
  }, [data, selectedIds]);

  const selectedData = useDeepMemo(
    () => data.filter((row) => customSelectedIds[row.id]),
    [data, customSelectedIds]
  );

  if (isLoading) {
    return <Loading />;
  }

  const handleRowSelect = (wellLogs: RowProps<WellLog>, value: boolean) => {
    dispatch(
      filterDataActions.setSelectedLogIds({
        [wellLogs.original.id]: value,
      })
    );
  };

  const handleRowsSelect = (value: boolean) => {
    const ids: { [key: string]: boolean } = {};
    data.forEach((row) => {
      ids[row.id] = value;
    });
    dispatch(filterDataActions.setSelectedLogIds(ids));
  };

  const onApplyChanges = ({ selected }: { selected: WellLog[] }) => {
    if (selected.length === 0) showErrorMessage(t(NO_LOGS_ERROR_MESSAGE));
    else {
      setWellLogsData(selected);
      setIsDialogOpen(true);
    }
  };

  const handleDialogClosed = (isOpen: boolean) => {
    setIsDialogOpen(isOpen);
  };

  const Preview = PreviewSelector({ onApplyChanges });

  return (
    <>
      <Table<WellLog>
        scrollTable
        id="log-file-type-result-table"
        data={data}
        columns={columns}
        options={tableOptions}
        selectedIds={customSelectedIds}
        handleRowSelect={handleRowSelect}
        handleRowsSelect={handleRowsSelect}
      />
      <Preview selected={selectedData} />
      <Modal
        fullWidth
        visible={isDialogOpen}
        onOk={() => handleDialogClosed(false)}
        onCancel={() => handleDialogClosed(false)}
      >
        <LogTypeViewer wellLogs={wellLogs} />
      </Modal>
    </>
  );
};

export default LogType;
