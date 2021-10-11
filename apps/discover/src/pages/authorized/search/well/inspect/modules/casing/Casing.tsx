import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import head from 'lodash/head';

import EmptyState from 'components/emptyState';
import { Table } from 'components/tablev2';
import { showErrorMessage } from 'components/toast';
import { filterDataActions } from 'modules/filterData/actions';
import { useFilterDataCasing } from 'modules/filterData/selectors';
import { useCasingsForTable } from 'modules/wellSearch/selectors';

import {
  COMMON_COLUMN_WIDTHS,
  NO_WELLBORE_ERROR_MESSAGE,
} from '../../constants';
import DialogPopup from '../common/DialogPopup';
import PreviewSelector from '../common/PreviewSelector';

import CasingView from './CasingView/CasingView';
import { CasingViewListWrapper } from './CasingView/elements';
import { getFortmattedCasingData } from './helper';
import { FormattedCasings, CasingData } from './interfaces';

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
    Header: 'Casing Type',
    accessor: 'casingNames',
  },
  {
    Header: 'Top MD',
    accessor: 'topMD',
  },
  {
    Header: 'Bottom MD',
    accessor: 'bottomMD',
  },
  {
    Header: 'OD Min',
    accessor: 'odMin',
  },
  {
    Header: 'OD Max',
    accessor: 'odMax',
  },
  {
    Header: 'ID Min',
    accessor: 'idMin',
  },
];

const tableOptions = {
  height: '100%',
  checkable: true,
  flex: false,
  hideScrollbars: true,
};

export const Casing: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [formattedCasings, setFormattedCasings] = useState<FormattedCasings[]>(
    []
  );
  const { selectedIds } = useFilterDataCasing();
  const { t } = useTranslation('WellData');

  const dispatch = useDispatch();

  const { casings: data, isLoading } = useCasingsForTable();

  const onApplyChanges = ({ selected }: { selected: CasingData[] }) => {
    if (selected.length === 0) showErrorMessage(t(NO_WELLBORE_ERROR_MESSAGE));
    else {
      // Set formatted casing data in the state
      setFormattedCasings(getFortmattedCasingData(selected));
      setIsDialogOpen(true);
    }
  };

  const handleDialogClosed = (isOpen: boolean) => {
    setIsDialogOpen(isOpen);
  };

  const handleRowSelect = (casingData: CasingData, value: boolean) => {
    dispatch(
      filterDataActions.setSelectedCasingIds({ [casingData.id]: value })
    );
  };

  const handleRowsSelect = (value: boolean) => {
    const ids: { [key: string]: boolean } = {};
    data.forEach((row) => {
      ids[row.id] = value;
    });
    dispatch(filterDataActions.setSelectedCasingIds(ids));
  };

  const Preview = PreviewSelector({ onApplyChanges });

  if (data.length > 0) {
    columns.forEach((column) => {
      switch (column.accessor) {
        case 'topMD':
          column.Header = `Top MD (${head(data)?.mdUnit})`; // eslint-disable-line no-param-reassign
          break;
        case 'bottomMD':
          column.Header = `Bottom MD (${head(data)?.mdUnit})`; // eslint-disable-line no-param-reassign
          break;
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

  if (isLoading) {
    return <EmptyState isLoading={isLoading} />;
  }
  return (
    <>
      <Table<CasingData>
        id="log-file-type-result-table"
        scrollTable
        data={data}
        columns={columns}
        options={tableOptions}
        selectedIds={selectedIds}
        handleRowSelect={handleRowSelect}
        handleRowsSelect={handleRowsSelect}
      />
      <Preview selected={data.filter((row: any) => selectedIds[row.id])} />
      <DialogPopup isopen={isDialogOpen} handleClose={handleDialogClosed}>
        <CasingViewListWrapper data-testid="casing-preview-content">
          {formattedCasings.map((formattedCasing) => (
            <CasingView
              key={`${formattedCasing.key}KEY`}
              name={formattedCasing.name}
              casings={formattedCasing.casings}
            />
          ))}
        </CasingViewListWrapper>
      </DialogPopup>
    </>
  );
};

export default Casing;
