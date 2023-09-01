import { Dispatch, SetStateAction } from 'react';

import styled from 'styled-components';

import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { Select, SelectProps } from 'antd';

import { LABELING_TABLE_COLUMN_WIDTH } from '../constants';
import { useSearchMatchInputOptions } from '../hooks/useSearchMatchInputOptions';
import { ManualMatch, MatchedInstance } from '../types';

export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  debounceTimeout?: number;
}

export const ManualMatchInput = ({
  originExternalId,
  manualMatches,
  setManualMatches,
}: {
  originExternalId: string;
  manualMatches: {
    [key: string]: ManualMatch;
  };
  setManualMatches: Dispatch<
    SetStateAction<{
      [key: string]: ManualMatch;
    }>
  >;
}) => {
  const { matchInputOptionsFetcher, matchInputOptions, searching } =
    useSearchMatchInputOptions();

  const handleSelectedMatch = (value: MatchedInstance) => {
    setManualMatches((prevMatches) => ({
      ...prevMatches,
      [originExternalId]: {
        ...prevMatches[originExternalId],
        matchedInstance: value,
      },
    }));
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCheckNoMatch = (_: any, value: string | boolean | undefined) => {
    setManualMatches((prevMatches) => ({
      ...prevMatches,
      [originExternalId]: {
        ...prevMatches[originExternalId],
        shouldNotMatch: !!value,
      },
    }));
  };

  return (
    <>
      <ManualMatchInputCell>
        <Select
          placeholder="Expected match..."
          labelInValue
          allowClear
          value={manualMatches[originExternalId].matchedInstance}
          showSearch
          filterOption={false}
          onSearch={matchInputOptionsFetcher}
          onChange={handleSelectedMatch}
          onClick={() => {
            matchInputOptionsFetcher(''); // Fetch initial options with an empty query
          }}
          notFoundContent={searching ? <Spinner /> : null}
          style={{ width: '100%' }}
          options={matchInputOptions}
        />
      </ManualMatchInputCell>
      {/*
      This is disabled as the backend doesn't support this.
       <CheckboxContainer>
        <Tooltip content="No Match">
          <Checkbox
            checked={manualMatches[originExternalId].shouldNotMatch}
            onChange={handleCheckNoMatch}
          />
        </Tooltip>
      </CheckboxContainer> */}
    </>
  );
};

const ManualMatchInputCell = styled.div`
  width: ${LABELING_TABLE_COLUMN_WIDTH}px;
`;
