import { Body, Colors, Icon, Input } from '@cognite/cogs.js';
import { useActiveWorkflow } from 'hooks';
import { WorkflowStep } from 'modules/types';
import { useWorkflowItems } from 'modules/workflows';
import React, { useState } from 'react';
import styled from 'styled-components';
import { FileInfo } from '@cognite/sdk';
import { useHistory, useParams } from 'react-router-dom';
import { diagramPreview } from 'routes/paths';
import ColumnApproval from 'pages/PageResultsOverview/SectionResults/columns/ColumnApproval';
import { stringContains } from 'modules/contextualization/utils';

type JobDiagramsProps = {
  step: WorkflowStep;
};

type FileItemProps = {
  file: FileInfo;
  isSelected: boolean;
  onClick: () => void;
};
const FileItem = ({ file, isSelected, onClick }: FileItemProps) => {
  return (
    <FileItemWrapper isSelected={isSelected} onClick={onClick}>
      <div className="header">
        <Icon
          type="PDF"
          style={{
            marginTop: '20px',
            marginLeft: '16px',
          }}
        />
      </div>
      <div className="title">
        <Body level={2}>{file.name}</Body>
      </div>
      <div className="tag">
        <ColumnApproval />
      </div>
    </FileItemWrapper>
  );
};

const JobDiagrams = ({ step }: JobDiagramsProps) => {
  const history = useHistory();

  const { tenant, fileId } = useParams<{ tenant: string; fileId: string }>();
  const selectedFileId = Number(fileId);

  const { workflowId } = useActiveWorkflow(step);
  const [query, setQuery] = useState<string>('');

  const { diagrams } = useWorkflowItems(workflowId, true);

  const filteredDiagrams = diagrams.filter((file) =>
    stringContains(file.name, query)
  );

  return (
    <ListWrapper>
      <SearchBoxWrapper
        placeholder="File name"
        onChange={(e) => setQuery(e.currentTarget.value)}
        value={query}
      />
      {filteredDiagrams.length ? (
        filteredDiagrams.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            isSelected={selectedFileId === file.id}
            onClick={() =>
              history.push(diagramPreview.path(tenant, workflowId, file.id))
            }
          />
        ))
      ) : (
        <Body level={2} style={{ marginTop: '12px' }}>
          No file names match the query.
        </Body>
      )}
    </ListWrapper>
  );
};

export default JobDiagrams;

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  min-width: 200px;
  align-content: space-around;
  font-family: 'Inter';
  font-weight: 600;
  padding: 16px 24px 0 0;
  border-right: 1px solid ${Colors['greyscale-grey2'].hex()};
  color: ${Colors['greyscale-grey6'].hex()};
`;

const SearchBoxWrapper = styled(Input)`
  border: 2px solid #d9d9d9;
  box-sizing: border-box;
  border-radius: 6px;
`;

const FileItemWrapper = styled.div<{ isSelected: boolean }>`
  margin-top: 12px;
  display: grid;
  grid-gap: 1rem;
  grid-template-rows: 1fr 1fr 1fr;
  grid-template-areas:
    'header'
    'title'
    'tag';
  background: #ffffff;

  border-radius: 6px;
  border: ${(props) =>
    props.isSelected
      ? `2px solid ${Colors['link-primary-default'].hex()}`
      : Colors['greyscale-grey2'].hex()};
  cursor: pointer;
  width: 200px;
  .header {
    background: ${Colors['greyscale-grey2'].hex()};
    border-radius: 6px;
    grid-area: header;
  }
  .title {
    grid-area: title;
    margin-left: 16px;
  }
  .tag {
    grid-area: tag;
    margin-left: 16px;
  }
`;
