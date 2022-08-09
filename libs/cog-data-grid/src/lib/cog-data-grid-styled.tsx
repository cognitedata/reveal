import 'ag-grid-community/dist/styles/ag-grid.css';
import './cog-data-grid-styles.css';

export interface CogDataGridStyledProps {
  theme: 'default' | 'compact';
  children?: any;
}
export const CogDataGridStyled = (props: CogDataGridStyledProps) => {
  const className = `cog-data-grid  ${
    props.theme === 'compact'
      ? 'cog-data-grid-compact'
      : 'cog-data-grid-default'
  }`;
  return <div className={className}>{props.children}</div>;
};
