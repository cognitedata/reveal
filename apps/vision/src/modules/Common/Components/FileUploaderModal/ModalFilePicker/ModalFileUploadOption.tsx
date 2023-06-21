import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import styled from 'styled-components';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DataSetSelect } from '@vision/modules/Common/Components/DataSetSelect/DataSetSelect';
import {
  setDataSetIds,
  setExtractExif,
} from '@vision/modules/Common/store/files/slice';
import { AppDispatch } from '@vision/store';
import { RootState } from '@vision/store/rootReducer';

import { Body, Checkbox, Detail, Icon, Tooltip } from '@cognite/cogs.js';

import 'antd/dist/antd.css';

export interface ModalFileUploadOptionProps {
  isDisabled?: boolean;
}

export function ModalFileUploadOption({
  isDisabled,
}: ModalFileUploadOptionProps) {
  const queryClient = new QueryClient();
  const dispatch = useDispatch<AppDispatch>();

  const { dataSetIds } = useSelector((state: RootState) => state.fileReducer); // remove these state dependencies
  const { extractExif } = useSelector((state: RootState) => state.fileReducer);

  return (
    <OptionContainer>
      <QueryClientProvider client={queryClient}>
        <DatasetTextContainer>
          <Body level={1} strong>
            Organize files
          </Body>
          <Detail color="#8C8C8C">Optional</Detail>
        </DatasetTextContainer>
        <DatasetOptionContainer>
          <DataSetSelect
            disabled={isDisabled}
            style={{ width: '208px', marginRight: '30px' }}
            onSelectionChange={(value) => {
              dispatch(setDataSetIds(value));
            }}
            selectedDataSetIds={dataSetIds}
            allowClear
          />
          <Checkbox
            name="exif-option"
            disabled={isDisabled}
            checked={extractExif}
            onChange={(_event, next) => {
              dispatch(setExtractExif(next as boolean));
            }}
          >
            Extract Exif-data from files
          </Checkbox>
          <Tooltip
            // wrapped
            content="Exif is the format for storing camera-generated metadata. When this metadata exists, you can extract it, and include it with metadata on your image files."
          >
            <Icon type="HelpFilled" />
          </Tooltip>
        </DatasetOptionContainer>
      </QueryClientProvider>
    </OptionContainer>
  );
}

const OptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 30px 0px 0px 0px;
  gap: 14px;
`;

const DatasetTextContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
`;

const DatasetOptionContainer = styled.div`
  display: flex;
  gap: 2px;

  .ant-select-selector {
    background: white;
  }
`;
