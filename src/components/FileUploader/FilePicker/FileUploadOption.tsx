import React from 'react';
import styled from 'styled-components';
import { Checkbox, Detail, Icon, PrimaryTooltip } from '@cognite/cogs.js';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { setExtractExif } from 'src/store/uploadedFilesSlice';

export interface FileUploadOptionProps {
  isDisabled?: boolean;
}

export function FileUploadOption({ isDisabled }: FileUploadOptionProps) {
  const queryClient = new QueryClient();
  const dispatch = useDispatch();

  // const { dataSetIds } = useSelector((state: RootState) => state.uploadedFiles);
  const { extractExif } = useSelector(
    (state: RootState) => state.uploadedFiles
  );

  return (
    <OptionContainer>
      <QueryClientProvider client={queryClient}>
        <DatasetContainer>
          <DatasetTextContainer>
            <Detail strong>Add files to data set</Detail>
            <Detail color="#8C8C8C">(Optional)</Detail>
          </DatasetTextContainer>
          {/* <DataSetFilter // TODO: use the new component in explorer once it is available
            isDisabled={isDisabled}
            resourceType="file"
            value={dataSetIds}
            setValue={(value) => {
              dispatch(setDataSetIds(value));
            }}
            isMulti={false}
          /> */}
        </DatasetContainer>
      </QueryClientProvider>
      <Checkbox
        name="exif-option"
        disabled={isDisabled}
        value={extractExif}
        onChange={(value) => {
          dispatch(setExtractExif(value));
        }}
      >
        Extract Exif-data from files
        <PrimaryTooltip
          tooltipTitle="Exif"
          tooltipText="Exif is a standard that defines specific information related to imagery data (e.g. camera exposure and GPS location). By selecting this option, Exif-data will be extracted from the files (if available) and stored as metadata on the files."
        >
          <Icon type="HelpFilled" style={{ marginLeft: '11px' }} />
        </PrimaryTooltip>
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
