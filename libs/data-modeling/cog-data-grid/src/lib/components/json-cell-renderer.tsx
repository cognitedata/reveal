import { ICellRendererParams } from 'ag-grid-community';

export const JsonCellRenderer = (props: ICellRendererParams) => {
  if (!props.value) {
    return '';
  }

  return JSON.stringify(props.value);
};
