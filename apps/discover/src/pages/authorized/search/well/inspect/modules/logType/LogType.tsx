import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { Sequence } from '@cognite/sdk';

import { ExpandButton } from 'components/buttons';
import { Dropdown } from 'components/dropdown';
import { WhiteLoader } from 'components/loading';
import { Table } from 'components/tablev2';
import { showErrorMessage } from 'components/toast';
import { filterDataActions } from 'modules/filterData/actions';
import { useFilterDataLog } from 'modules/filterData/selectors';
import {
  useLogTypes,
  useSelectedWellBoresGeomechanic,
  useSelectedWellBoresLogs,
  useSelectedWellBoresPPFG,
} from 'modules/wellSearch/selectors';

import { COMMON_COLUMN_WIDTHS, NO_LOGS_ERROR_MESSAGE } from '../../constants';
import { DialogPopup } from '../common/DialogPopup';
import { ModuleFilterDropdownWrapper } from '../common/elements';
import PreviewSelector from '../common/PreviewSelector';

import { FilterLogType, LogTypeData } from './interfaces';
import { LogTypeViewer } from './LogTypeViewer';

const filterLogTypes: FilterLogType[] = [
  {
    id: 1,
    title: 'All',
  },
];

const columns = [
  {
    Header: 'Well',
    accessor: 'wellName',
    width: COMMON_COLUMN_WIDTHS.WELL_NAME,
  },
  {
    Header: 'Wellbore',
    accessor: 'wellboreName',
    width: COMMON_COLUMN_WIDTHS.WELLBORE_NAME,
  },
  {
    Header: 'Log Name',
    accessor: 'name',
  },
  {
    Header: 'Category',
    accessor: 'category',
  },
  {
    Header: 'Source',
    accessor: 'metadata.source',
  },
  {
    Header: 'Modified',
    accessor: 'modified',
    width: 'auto',
  },
];

const tableOptions = {
  checkable: true,
  height: '100%',
  hideScrollbars: true,
  flex: false,
};

const logTypeTitleMapping: { [key: string]: string } = {
  logType: 'Petrel Log',
  ppfg: 'PPFG Log',
  geomechanic: 'Geomechanic Log',
};

export const LogType: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [logTypes, setLogTypes] = useState<Sequence[]>([]);
  const { filterLogType, selectedIds } = useFilterDataLog();
  const dispatch = useDispatch();
  const { t } = useTranslation('WellData');

  const { isLoading: logsLoading } = useSelectedWellBoresLogs();
  const { isLoading: geomechanicsLoading } = useSelectedWellBoresGeomechanic();
  const { isLoading: ppfgsLoading } = useSelectedWellBoresPPFG();

  const updateFilterData = (tableData: LogTypeData[]) => {
    tableData.forEach((row) => {
      const title = logTypeTitleMapping[row.logType];
      if (!filterLogTypes.map((item) => item.title).includes(title)) {
        filterLogTypes.push({
          id: filterLogTypes.length + 1,
          title,
        });
      }
    });
  };

  const data: LogTypeData[] = useLogTypes();

  useEffect(() => {
    updateFilterData(data);
  }, [data]);

  const tableData = useMemo(
    () =>
      data
        .filter(
          (item) =>
            filterLogType.id === 1 ||
            logTypeTitleMapping[item.logType] === filterLogType.title
        )
        .map((item) => ({
          ...item,
          category: logTypeTitleMapping[item.logType],
        })),
    [data, filterLogType]
  );

  const customSelectedIds = useMemo(() => {
    const tempSelectedIds = { ...selectedIds };
    /**
     * Set undefined id mappings to true to set checked newly selected wells logs.
     * This way initially all the logs will be selected.
     */
    data.forEach((row) => {
      if (tempSelectedIds[row.id] === undefined) tempSelectedIds[row.id] = true;
    });
    return tempSelectedIds;
  }, [data, selectedIds]);

  const selectedData = useMemo(
    () => data.filter((row) => customSelectedIds[row.id]),
    [data, customSelectedIds]
  );

  if (ppfgsLoading || geomechanicsLoading || logsLoading) {
    return <WhiteLoader />;
  }

  const handleRowSelect = (logTypeData: LogTypeData, value: boolean) => {
    dispatch(filterDataActions.setSelectedLogIds({ [logTypeData.id]: value }));
  };

  const handleRowsSelect = (value: boolean) => {
    const ids: { [key: string]: boolean } = {};
    data.forEach((row) => {
      ids[row.id] = value;
    });
    dispatch(filterDataActions.setSelectedLogIds(ids));
  };

  const onApplyChanges = ({ selected }: { selected: LogTypeData[] }) => {
    const filteredLogTypes = selected.filter(
      (row) =>
        filterLogType.id === 1 ||
        logTypeTitleMapping[row.logType] === filterLogType.title
    );
    if (filteredLogTypes.length === 0)
      showErrorMessage(t(NO_LOGS_ERROR_MESSAGE));
    else {
      setLogTypes(filteredLogTypes);
      setIsDialogOpen(true);
    }
  };

  const handleDialogClosed = (isOpen: boolean) => {
    setIsDialogOpen(isOpen);
  };

  const Preview = PreviewSelector({ onApplyChanges });

  return (
    <>
      <ModuleFilterDropdownWrapper>
        <Dropdown
          handleChange={(_e: any, item: FilterLogType) => {
            dispatch(filterDataActions.setLogFilterLogType({ ...item }));
          }}
          selected={{ ...filterLogType }}
          items={filterLogTypes}
          displayField="title"
          valueField="id"
        >
          <ExpandButton
            text={filterLogType.id === 1 ? 'Log Type' : filterLogType.title}
          />
        </Dropdown>
      </ModuleFilterDropdownWrapper>
      <Table<LogTypeData>
        scrollTable
        id="log-file-type-result-table"
        data={tableData}
        columns={columns}
        options={tableOptions}
        selectedIds={customSelectedIds}
        handleRowSelect={handleRowSelect}
        handleRowsSelect={handleRowsSelect}
      />
      <Preview selected={selectedData} />
      <DialogPopup isopen={isDialogOpen} handleClose={handleDialogClosed}>
        <LogTypeViewer logTypes={logTypes} />
      </DialogPopup>
    </>
  );
};

export default LogType;
