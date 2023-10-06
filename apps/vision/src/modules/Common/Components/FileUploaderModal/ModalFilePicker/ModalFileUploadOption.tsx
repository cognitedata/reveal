import React from 'react';
import { useSelector } from 'react-redux';

import styled from 'styled-components';

import { Body, Checkbox, Detail, Icon, Tooltip } from '@cognite/cogs.js';

import { useThunkDispatch } from '../../../../../store';
import { RootState } from '../../../../../store/rootReducer';
import { setDataSetIds, setExtractExif } from '../../../store/files/slice';
import { DataSetSelect } from '../../DataSetSelect/DataSetSelect';

import 'antd/dist/antd.css';

export interface ModalFileUploadOptionProps {
  isDisabled?: boolean;
}

export function ModalFileUploadOption({
  isDisabled,
}: ModalFileUploadOptionProps) {
  const dispatch = useThunkDispatch();

  const { dataSetIds } = useSelector((state: RootState) => state.fileReducer); // remove these state dependencies
  const { extractExif } = useSelector((state: RootState) => state.fileReducer);

  return (
    <OptionContainer>
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
