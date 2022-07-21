import 'ag-grid-community/dist/styles/ag-grid.css';
import './cog-data-grid-styles.css';

export interface CogDataGridStyledProps {
  children?: any;
}
export const CogDataGridStyled = (props: CogDataGridStyledProps) => {
  const className = 'cog-data-grid cog-data-grid-default';
  return <div className={className}>{props.children}</div>;
};
