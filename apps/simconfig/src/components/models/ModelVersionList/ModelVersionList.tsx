import { useMatch } from 'react-location';
import { useSelector } from 'react-redux';

import formatDistance from 'date-fns/formatDistance';
import formatISO9075 from 'date-fns/formatISO9075';
import parseISO from 'date-fns/parseISO';
import styled from 'styled-components/macro';

import type { CollapsePanelProps } from '@cognite/cogs.js';
import { Collapse, Icon, Skeleton, Tooltip } from '@cognite/cogs.js';
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
                <div className="entry">
                  <div className="description">Version</div>
                  <div className="value">{modelFile.metadata.version}</div>
                </div>

                <div className="entry">
                  <div className="description">Description</div>
                  <div className="value">
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
                  </div>
                </div>

                <div className="entry">
                  <div className="description">Created</div>
                  <div className="value">
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
                  </div>
                </div>
              </div>
            }
            key={`${modelFile.id}-model-version`}
          >
            <ModelVersionDetails modelFile={modelFile} />
          </Collapse.Panel>
        ))}
      </Collapse>
    </ModelVersionListContainer>
  );
}

const ModelVersionListContainer = styled.div`
  .version-header {
    .entry {
      .description {
        color: rgba(0, 0, 0, 0.55);
        font-size: 12px;
      }
      .value {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.9);
      }
    }

    display: grid;
    width: 100%;
    grid-template-columns: 1fr 9fr 3fr;
    color: #333333;
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

  .rc-collapse {
    background-color: transparent !important;
  }

  .rc-collapse-item {
    background-color: #fafafa;
    border-radius: 8px;
    margin-bottom: 8px;
    border-top: none !important;
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
