import { CogDataGrid } from '@cognite/cog-data-grid';
import { useState } from 'react';
import { configSample } from './config-mock';

import { textCellEditorConfig } from './custom-types/text-col-type';
import { responseSample } from './response-mock';

export const DataGridPage = () => {
  const [data, setData] = useState(responseSample);

  const onCellValueChanged = (e: any) => {
    const { rowIndex, value, colDef } = e;
    const field = colDef.field;

    const newData = data.map((el, idx) => {
      if (idx === rowIndex) return { ...el, [field]: value };
      return el;
    });

    setData(newData);
  };
  const onGridReady = (e: any) => {
    console.log('grid ready', e);
  };

  return (
    <div style={{ height: '100%', width: '1000px' }}>
      <CogDataGrid
        columnTypes={
          {
            // TEXT: textCellEditorConfig,
            // NUMBER: numberCellEditorConfig,
            // DECIMAL: decimalCellEditorConfig,
          }
        }
        data={responseSample}
        tableType={'large'}
        config={configSample}
        onCellValueChanged={onCellValueChanged}
        onGridReady={onGridReady}
      />
    </div>
  );
};
