import * as React from 'react';

import styled from 'styled-components/macro';

import ManageColumnsPanel from 'components/ManageColumnsPanel';
import { AvailableColumn } from 'pages/authorized/search/common/types';

const Root = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-self: flex-start;
`;

export const GROUP_EXACT_DUPLICATES_LABEL = 'Group exact duplicates';
export const SEARCH_IN_SENSITIVE_INDEX = 'Search in Sensitive index';

interface Props {
  columns: AvailableColumn[];
  // viewMode?: ViewMode;
  // searchForSensitive?: boolean;
  handleColumnSelection: (column: AvailableColumn) => void;
  // handleSearchInSensitiveToggle?: (
  //   event: React.ChangeEvent<HTMLInputElement>,
  //   checked: boolean
  // ) => void;
  // setViewModel?: (viewMode: ViewMode) => void;
  // hideGroupDuplicateOption?: boolean;
}

const OptionsPanel: React.FC<Props> = ({ columns, handleColumnSelection }) => {
  return (
    <Root>
      <ManageColumnsPanel
        columns={columns}
        handleColumnSelection={handleColumnSelection}
      />
    </Root>
  );
};

export default OptionsPanel;
