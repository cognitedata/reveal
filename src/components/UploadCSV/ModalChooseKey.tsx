import React from 'react';
import styled from 'styled-components';
import { Tag, Select, Alert } from 'antd';
import { Icon } from '@cognite/cogs.js';

import { getContainer } from 'utils/utils';

type Props = {
  columns: any;
  selectedKeyIndex: number;
  setSelectedKeyIndex: (selectedKeyIndex: number) => void;
};

export const ModalChooseKey = (props: Props): JSX.Element => {
  const { columns, selectedKeyIndex, setSelectedKeyIndex } = props;

  const checkAndReturnCols = () => {
    return (
      <div>
        {columns.map((header: string) => (
          <Tag style={{ margin: '5px' }} key={header}>
            {header}
          </Tag>
        ))}
        <div style={{ marginTop: '20px' }}>
          <p>Select a column to use as a unique key for the table</p>
          Unique Key Column :{' '}
          <Select
            defaultValue="-1"
            style={{ width: '60%' }}
            value={String(selectedKeyIndex)}
            onChange={(val: string) => setSelectedKeyIndex(Number(val))}
            getPopupContainer={getContainer}
          >
            <Select.Option value="-1" key="-1">
              Generate a new Key Column
            </Select.Option>
            {columns.map((header: string, index: number) => (
              <Select.Option key={String(index)} value={String(index)}>
                {header}
              </Select.Option>
            ))}
          </Select>
          {selectedKeyIndex === -1 && (
            <Alert
              style={{ marginTop: '20px' }}
              type="info"
              message="Please note that choosing the auto generated key column option, will clear all existing data in the table"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <Wrapper>
      <p>The file uploaded contains the following columns: </p>
      {columns && columns?.length > 0 ? (
        checkAndReturnCols()
      ) : (
        <Icon type="Loading" />
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
