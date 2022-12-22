import { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import { CSSProperties, ForwardedRef, forwardRef } from 'react';
import { CogDataGridStyled } from './cog-data-grid-styled';
import { ThemeNames } from './types';

export interface CogDataTableProps extends AgGridReactProps {
  theme?: ThemeNames;
  wrapperStyle?: CSSProperties;
}

// This is just a thin wrapper arround ag-grid that wraps the table with custom styles
export const CogDataTable = forwardRef<AgGridReact, CogDataTableProps>(
  (props: CogDataTableProps, ref: ForwardedRef<AgGridReact>) => {
    return (
      <CogDataGridStyled
        theme={props.theme || 'default'}
        style={props.wrapperStyle}
        shouldShowDraftRows={false} // hack, needs to be refactored
        shouldShowPublishedRows={true} // hack, needs to be refactored
      >
        <AgGridReact ref={ref} {...props}>
          {props.children}
        </AgGridReact>
      </CogDataGridStyled>
    );
  }
);
