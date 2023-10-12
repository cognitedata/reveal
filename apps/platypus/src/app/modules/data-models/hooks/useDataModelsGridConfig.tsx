import { useCallback } from 'react';

import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { createRoot } from 'react-dom/client';

import { gridConfigService } from '@cognite/cog-data-grid';
import { Icon } from '@cognite/cogs.js';

import { TOKENS } from '../../../di';
import { useInjection } from '../../../hooks/useInjection';
import { useTranslation } from '../../../hooks/useTranslation';
import { DataModelActionsCellRenderer } from '../components/DataModelsTable/DataModelActionsCellRenderer';
import { DataModelNameCellRenderer } from '../components/DataModelsTable/DataModelNameCellRenderer';

const caseInsensitiveSorting = (a: string, b: string) => {
  if (!a || a.trim() === '') {
    return -1;
  }
  if (!b || b.trim() === '') {
    return 1;
  }
  return a.localeCompare(b, undefined, { sensitivity: 'base' });
};

export const useDataModelsGridConfig = () => {
  const { t } = useTranslation('DataModelsTable');
  const dateUtils = useInjection(TOKENS.dateUtils);

  const getGridOptions = useCallback(() => {
    return Object.assign(gridConfigService.getGridConfig('basic-striped'), {
      defaultColDef: {
        editable: false,
        filter: false,
        sortable: true,
        resizable: true,
      },
      icons: {
        // We need to use this icons, however we can get them only as React components
        // Ag-grid needs to have them as font, svg or HTML element
        // so we need to render them here
        sortAscending: () => {
          const domNode = document.createElement('div');
          const root = createRoot(domNode);
          root.render(<Icon type="SortAscending" />);
          return domNode;
        },
        sortDescending: () => {
          const domNode = document.createElement('div');
          const root = createRoot(domNode);
          root.render(<Icon type="SortDescending" />);
          return domNode;
        },
      },
    }) as GridOptions;
  }, []);

  const getColDefs = useCallback((): ColDef[] => {
    return [
      {
        field: 'name',
        headerName: t('data_models_list_name_column', 'Data Model'),
        type: 'textColType',
        cellRenderer: DataModelNameCellRenderer,
        comparator: caseInsensitiveSorting,
      },
      {
        field: 'updatedTime',
        headerName: t('data_models_list_last_modified_column', 'Last Modified'),
        sortable: true,
        sort: 'desc',
        valueFormatter: (params: ValueFormatterParams) =>
          dateUtils.format(params.value),
      },
      {
        field: 'space',
        headerName: t('data_models_list_space_column', 'Space'),
        type: 'textColType',
        comparator: caseInsensitiveSorting,
      },
      {
        field: 'description',
        headerName: t('data_models_list_description_column', 'Description'),
        type: 'textColType',
        comparator: caseInsensitiveSorting,
      },
      {
        headerName: '',
        type: 'customColType',
        sortable: false,
        cellRenderer: DataModelActionsCellRenderer,
      },
    ];
  }, [dateUtils, t]);

  return {
    getColDefs,
    getGridOptions,
  };
};
