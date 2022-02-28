import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import './cog-data-grid-styles.css';
import { TableType } from './core/types';

export interface CogDataGridStyledProps {
  tableType?: TableType;
  children?: any;
}
export const CogDataGridStyled = (props: CogDataGridStyledProps) => {
  const className =
    props.tableType === 'large'
      ? 'cog-data-grid cog-data-grid-large'
      : 'cog-data-grid cog-data-grid-default';
  return <div className={className}>{props.children}</div>;
};
