import 'ag-grid-community/dist/styles/ag-grid.css';
import './cog-data-grid-styles.css';

export interface CogDataGridStyledProps {
  theme: 'default' | 'compact';
  shouldShowDraftRows?: boolean;
  shouldShowPublishedRows?: boolean;
  children?: any;
}
export const CogDataGridStyled = (props: CogDataGridStyledProps) => {
  const shouldShowDraftRows =
    props.shouldShowDraftRows === undefined ? true : props.shouldShowDraftRows;
  const shouldShowPublishedRows =
    props.shouldShowPublishedRows === undefined
      ? true
      : props.shouldShowPublishedRows;
  const className = `cog-data-grid ${
    props.theme === 'compact'
      ? 'cog-data-grid-compact'
      : 'cog-data-grid-default'
  } ${shouldShowDraftRows ? '' : 'cog-data-grid--hide-draft-rows'} ${
    shouldShowPublishedRows ? '' : 'cog-data-grid--hide-published-rows'
  }`;
  return <div className={className}>{props.children}</div>;
};
