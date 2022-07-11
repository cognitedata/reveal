import React from 'react';
import styled from 'styled-components';
import { Body, Checkbox, Detail, Icon, Tooltip } from '@cognite/cogs.js';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  setDataSetIds,
  setExtractExif,
} from 'src/modules/Common/store/files/slice';
import { DataSetSelect } from '@cognite/data-exploration';
import 'antd/dist/antd.css';

export interface ModalFileUploadOptionProps {
  isDisabled?: boolean;
}

export function ModalFileUploadOption({
  isDisabled,
}: ModalFileUploadOptionProps) {
  const queryClient = new QueryClient();
  const dispatch = useDispatch();

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
            style={{ width: '208px' }}
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
            onChange={(value) => {
              dispatch(setExtractExif(value));
            }}
          >
            Extract Exif-data from files
            <Tooltip
              wrapped
              content="Exif is a standard that defines specific information related to imagery data (e.g. camera exposure and GPS location). By selecting this option, Exif-data will be extracted from the files (if available) and stored as metadata on the files."
            >
              <Icon type="HelpFilled" style={{ marginLeft: '11px' }} />
            </Tooltip>
          </Checkbox>
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
  gap: 32px;

  .ant-select-selector {
    background: white;
  }
`;
