import React from 'react';
import {
  setDataSetIds,
  setExtractExif,
} from 'src/modules/Common/store/files/slice';
import styled from 'styled-components';
import { Checkbox, Detail, Icon, Tooltip } from '@cognite/cogs.js';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { DataSetSelect } from '@cognite/data-exploration';
import 'antd/dist/antd.css';

export interface FileUploadOptionProps {
  isDisabled?: boolean;
}

export function FileUploadOption({ isDisabled }: FileUploadOptionProps) {
  const queryClient = new QueryClient();
  const dispatch = useDispatch();

  const { dataSetIds } = useSelector((state: RootState) => state.fileReducer);
  const { extractExif } = useSelector((state: RootState) => state.fileReducer);

  return (
    <OptionContainer>
      <QueryClientProvider client={queryClient}>
        <DatasetContainer>
          <DatasetTextContainer>
            <Detail strong>Add files to data set</Detail>
            <Detail color="#8C8C8C">(Optional)</Detail>
          </DatasetTextContainer>
          <DataSetSelect
            disabled={isDisabled}
            style={{ width: '300px' }}
            onSelectionChange={(value) => {
              dispatch(setDataSetIds(value));
            }}
            selectedDataSetIds={dataSetIds}
            allowClear
          />
        </DatasetContainer>
      </QueryClientProvider>
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
    </OptionContainer>
  );
}

const OptionContainer = styled.div`
  display: flex;
  column-gap: 72px;
`;

const DatasetContainer = styled.div`
  display: grid;
  row-gap: 4px;
  width: 307px;
`;

const DatasetTextContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;
