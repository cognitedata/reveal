import { useMatch } from 'react-location';
import { useSelector } from 'react-redux';

import formatDistance from 'date-fns/formatDistance';
import formatISO9075 from 'date-fns/formatISO9075';
import parseISO from 'date-fns/parseISO';
import styled from 'styled-components/macro';

import type { CollapsePanelProps } from '@cognite/cogs.js';
import { Collapse, Icon, Label, Skeleton, Tooltip } from '@cognite/cogs.js';
import type { Simulator } from '@cognite/simconfig-api-sdk/rtk';
import { useGetModelFileVersionListQuery } from '@cognite/simconfig-api-sdk/rtk';

import { ModelVersionDetails } from 'components/models';
import { selectProject } from 'store/simconfigApiProperties/selectors';

interface ModelVersionListProps {
  simulator: Simulator;
  modelName: string;
}

export function ModelVersionList({
  modelName,
  simulator,
}: ModelVersionListProps) {
  const project = useSelector(selectProject);
  const { search } = useMatch();

  const { data, isFetching } = useGetModelFileVersionListQuery({
    project,
    simulator,
    modelName,
  });

  if (!isFetching && !data) {
    // Uninitialized state
    return null;
  }

  if (isFetching) {
    return <Skeleton.List lines={4} borders />;
  }

  return (
    <ModelVersionListContainer>
      <ModelVersionListHeaderContainer>
        <div>Version</div>
        <div>Description</div>
        <div>Created</div>
      </ModelVersionListHeaderContainer>
      <Collapse
        defaultActiveKey={
          typeof search.id === 'string'
            ? search.id
            : data?.modelFileList[0].id.toString()
        }
        expandIcon={expandIcon}
      >
        {data?.modelFileList.map((modelFile) => (
          <Collapse.Panel
            header={
              <div className="version-header">
                <span className="version">{modelFile.metadata.version}</span>
                <span className="description">
                  {modelFile.metadata.description.length >= 50 ? (
                    <>
                      {`${modelFile.metadata.description.slice(0, 50)}…`}
                      <Tooltip
                        content={modelFile.metadata.description}
                        maxWidth={200}
                      >
                        <Icon type="Info" />
                      </Tooltip>
                    </>
                  ) : (
                    modelFile.metadata.description || '(no description)'
                  )}
                  {modelFile.metadata.errorMessage && (
                    <Tooltip content={modelFile.metadata.errorMessage}>
                      <Label className="error-label" size="small">
                        <Icon type="Info" />
                        Error
                      </Label>
                    </Tooltip>
                  )}
                </span>
                <span className="distance">
                  <Tooltip
                    content={formatISO9075(parseISO(modelFile.createdTime))}
                  >
                    <>
                      {formatDistance(
                        parseISO(modelFile.createdTime),
                        new Date(),
                        {
                          addSuffix: true,
                        }
                      )}
                    </>
                  </Tooltip>
                </span>
              </div>
            }
            key={modelFile.id}
          >
            <ModelVersionDetails modelFile={modelFile} />
          </Collapse.Panel>
        ))}
      </Collapse>
    </ModelVersionListContainer>
  );
}

const ModelVersionListHeaderContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 9fr 3.1fr;
  padding-top: 13px;
  padding-bottom: 13px;
  background-color: #fafafa;
  margin-bottom: 16px;
  font-size: 12px;
  padding-left: 40px;
  border-bottom: 1px solid #d9d9d9;
`;

const ModelVersionListContainer = styled.div`
  .version-header {
    display: grid;
    width: 100%;
    grid-template-columns: 1fr 9fr 3fr;
    color: #333333;
    .version,
    .description {
      font-size: 16px;
    }
    .version {
      font-weight: bold;
    }
    .error-label {
      border: 2px solid rgba(223, 66, 55, 0.2);
      border-radius: 4px;
      color: #cf2017;
      font-size: 13px;
      font-weight: 500;
      background-color: transparent;
      margin-left: 1em;
      .cogs-icon {
        margin-right: 7px;
      }
    }
  }
  .rc-collapse-item {
    background-color: #f5f5f5;
    border-radius: 8px;
    margin-bottom: 8px;
    border-top: none;
  }
  .rc-collapse {
    background-color: transparent;
  }
  .rc-collapse-header {
    padding: 12px !important;
  }
  .rc-collapse-extra {
    display: flex;
    align-items: center;
  }
  .rc-collapse-content-box {
    margin-top: 0px;
  }
`;

const expandIcon = ({ isActive }: CollapsePanelProps) => (
  <Icon
    style={{
      marginRight: 8,
      transition: 'transform .2s',
      transform: `rotate(${isActive ? 0 : -90}deg)`,
    }}
    type="ChevronDown"
  />
);
