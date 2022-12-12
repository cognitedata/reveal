import { CSSProperties } from 'react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import './cog-data-grid-styles.css';
import { ThemeClasses, ThemeNames } from './types';

export interface CogDataGridStyledProps {
  theme: ThemeNames;
  shouldShowDraftRows?: boolean;
  shouldShowPublishedRows?: boolean;
  children?: any;
  style?: CSSProperties;
}
export const CogDataGridStyled = (props: CogDataGridStyledProps) => {
  const shouldShowDraftRows =
    props.shouldShowDraftRows === undefined ? true : props.shouldShowDraftRows;

  const shouldShowPublishedRows =
    props.shouldShowPublishedRows === undefined
      ? true
      : props.shouldShowPublishedRows;

  const themeClasses: ThemeClasses = {
    default: 'cog-data-grid-default',
    compact: 'cog-data-grid-compact',
    suggestions: 'cog-data-grid-suggestions',
  };

  const classNames = ['cog-data-grid', themeClasses[props.theme]];
  if (!shouldShowDraftRows) {
    classNames.push('cog-data-grid--hide-draft-rows');
  }
  if (!shouldShowPublishedRows) {
    classNames.push('cog-data-grid--hide-published-rows');
  }

  return (
    <div className={classNames.join(' ')} style={props.style}>
      {props.children}
    </div>
  );
};
