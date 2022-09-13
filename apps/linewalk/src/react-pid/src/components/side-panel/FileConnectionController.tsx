import React, { useCallback, useState, useEffect } from 'react';
import { useAuthContext } from '@cognite/react-container';
import debounce from 'lodash/debounce';
import {
  DIAGRAM_PARSER_SOURCE,
  PidFileConnectionInstance,
} from '@cognite/pid-tools';
import {
  AutoComplete as CogsAutoComplete,
  Button as CogsButton,
  Icon,
  Row,
  Title,
} from '@cognite/cogs.js';
import styled from 'styled-components';
import { FileInfo } from '@cognite/sdk';

import { CollapseSeperator } from './CollapsableInstanceList';

const multiColName = 'col-2';

const SelectedInstanceInfo = styled.div`
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--cogs-greyscale-grey3);
  .${multiColName} {
    grid-template-columns: 3fr 2fr !important;
    margin-top: 0.5rem;
  }
  .cogs-row {
    gap: 2px !important;
    justify-items: start;
  }
`;

const AutoComplete = styled(CogsAutoComplete)`
  width: 100%;
  height: 28px;
  .cogs-select__control {
    border-radius: 6px 0px 0px 6px;
  }
  .cogs-select__single-value {
    font-size: 13px; // FIX some sort of auto resize
  }
  .cogs-select__option {
    font-size: 11px;
  }
  .cogs-select__menu {
    min-width: 100%;
    width: fit-content;
  }
`;

const AutoCompleteButton = styled(CogsButton)`
  border-radius: 0px 6px 6px 0px;
`;

const AutoCompleteButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const RemovableRow = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

interface Option {
  value: FileInfo;
  label: string;
}

interface FileConnectionControllerProps {
  fileConnection: PidFileConnectionInstance;
  updateFileConnection: (fileConnection: PidFileConnectionInstance) => void;
}

export const FileConnectionController: React.FC<
  FileConnectionControllerProps
> = ({ fileConnection, updateFileConnection }) => {
  const [labelNames, setLabelNames] = useState<string[]>([]);
  const [search, setSearch] = useState<string>('');
  const [fileInfos, setFileInfos] = useState<FileInfo[]>([]);
  const [clickedFileOption, setClickedFileOption] = useState<FileInfo>();

  const { client } = useAuthContext();

  useEffect(() => {
    const labels = fileConnection.labelIds.map(
      (labelId) => document.getElementById(labelId)!.textContent!
    );
    const formattedLabels = labels.join('-');

    onSearchInputChange(formattedLabels);
    setLabelNames(labels);
  }, [fileConnection]);

  const searchInputChangedHandler = useCallback(
    debounce((newValue: string): void => {
      if (newValue === '' && search.length > 1) return;

      setSearch(newValue);
      client?.files
        .search({
          filter: {
            mimeType: 'image/svg+xml',
            source: DIAGRAM_PARSER_SOURCE,
          },
          search: {
            name: newValue,
          },
          limit: 20,
        })
        .then((files) => setFileInfos(files));
    }, 300),
    []
  );

  const onSearchInputChange = (newValue: string) => {
    if (newValue) {
      setSearch(newValue);
      searchInputChangedHandler(newValue);
    }
  };

  const handleClickedOption = (result: Option): void => {
    onSearchInputChange(result.label);
    setClickedFileOption(result.value);
  };

  const assignFileLink = (): void => {
    updateFileConnection({
      ...fileConnection,
      linkedCdfFileId: clickedFileOption!.id,
      linkedCdfFileName: clickedFileOption!.name,
    });
  };

  const unassignFileLink = () => {
    updateFileConnection({
      ...fileConnection,
      linkedCdfFileId: undefined,
      linkedCdfFileName: undefined,
    });
  };

  const isDisabled = (): boolean => {
    return (
      !fileInfos.some((files) => files.name === search) ||
      clickedFileOption?.id === fileConnection.linkedCdfFileId
    );
  };

  return (
    <div>
      <CollapseSeperator>Selected Symbol Instance</CollapseSeperator>
      <SelectedInstanceInfo>
        <Row cols={1}>
          <Title level={6}>File Connection Id</Title>
          <span>{fileConnection.id}</span>
        </Row>
        <Row cols={2} className={multiColName}>
          <Row cols={1}>
            <Title level={6}>File Direction</Title>
            {`${fileConnection.direction}°: ${fileConnection.fileDirection}`}
          </Row>
          <Row cols={1}>
            <Title level={6}>Label name</Title>
            {labelNames.join(' ')}
          </Row>
        </Row>
        <Row cols={1}>
          <Title level={6}>Linked File Name</Title>
          {fileConnection.linkedCdfFileName ? (
            <RemovableRow>
              {fileConnection.linkedCdfFileName}
              <Icon
                onClick={unassignFileLink}
                type="Close"
                size={12}
                style={{ cursor: 'pointer' }}
              />
            </RemovableRow>
          ) : (
            'undefined'
          )}
        </Row>
      </SelectedInstanceInfo>
      <AutoCompleteButtonContainer>
        <AutoComplete
          placeholder="Search for Files"
          value={{ value: search, label: search }}
          options={fileInfos.map((fileInfo) => ({
            value: fileInfo,
            label: fileInfo.name,
          }))}
          handleInputChange={onSearchInputChange}
          onChange={handleClickedOption}
          menuPlacement="top"
          maxMenuHeight={500}
        />
        <AutoCompleteButton
          type="primary"
          onClick={assignFileLink}
          disabled={isDisabled()}
        >
          Add
        </AutoCompleteButton>
      </AutoCompleteButtonContainer>
    </div>
  );
};
