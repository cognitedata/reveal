import { useState } from 'react';
import { useMatch } from 'react-location';
import { useSelector } from 'react-redux';

import formatDistance from 'date-fns/formatDistance';
import formatISO9075 from 'date-fns/formatISO9075';
import parseISO from 'date-fns/parseISO';
import styled from 'styled-components/macro';

import type { CollapsePanelProps } from '@cognite/cogs.js';
import {
  Chip,
  Collapse,
  Icon,
  Pagination,
  Skeleton,
  Tooltip,
} from '@cognite/cogs.js';
import type { Simulator } from '@cognite/simconfig-api-sdk/rtk';
import { useGetModelFileVersionListQuery } from '@cognite/simconfig-api-sdk/rtk';

import { selectProject } from '../../../store/simconfigApiProperties/selectors';
import {
  INITIAL_ITEMS_PER_PAGE,
  getTotalPages,
  paginateData,
} from '../../../utils/pagination';
import { ModelVersionDetails } from '../ModelVersionDetails/ModelVersionDetails';

interface ModelVersionListProps {
  simulator: Simulator;
  modelName: string;
}

const DESCRIPTION_CUTOFF_LENGTH = 125;
type ItemsPerPage = React.ComponentProps<typeof Pagination>['itemsPerPage'];

export function ModelVersionList({
  modelName,
  simulator,
}: ModelVersionListProps) {
  const project = useSelector(selectProject);
  const { search } = useMatch();

  const [pageNumber, setPageNumber] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<ItemsPerPage>(
    INITIAL_ITEMS_PER_PAGE
  );

  const setItemPerPage = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage as ItemsPerPage);
  };

  const onPageChange = (page: number) => {
    setPageNumber(page);
  };

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

  if (data?.modelFileList.length === 0) {
    return null;
  }

  const slicedModels = paginateData(data?.modelFileList ?? [], pageNumber);

  const totalPages = getTotalPages(data?.modelFileList ?? []);

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
        {slicedModels.map((modelFile) => (
          <CollapsePanel
            header={
              <div className="version-header">
                <div className="entry">
                  <div className="description">Version</div>
                  <div className="value">{modelFile.metadata.version}</div>
                </div>

                <div className="entry">
                  <div className="description">Description</div>
                  <div className="value">
                    {modelFile.metadata.description.length >=
                    DESCRIPTION_CUTOFF_LENGTH ? (
                      <>
                        {`${modelFile.metadata.description.slice(
                          0,
                          DESCRIPTION_CUTOFF_LENGTH
                        )}…`}
                        <Tooltip
                          content={modelFile.metadata.description}
                          maxWidth={300}
                        >
                          <Icon type="Info" />
                        </Tooltip>
                      </>
                    ) : (
                      modelFile.metadata.description || '(no description)'
                    )}
                    {modelFile.metadata.errorMessage && (
                      <Tooltip
                        position="right"
                        content={
                          <div style={{ padding: 10 }}>
                            <b>{modelFile.metadata.errorMessage}</b>
                            {modelFile?.parsingLogs?.filter(
                              ({ level }) => level === 'ERROR'
                            )?.length && (
                              <div>
                                <br />
                                <ul>
                                  {modelFile?.parsingLogs
                                    ?.filter(({ level }) => level === 'ERROR')
                                    ?.map(({ message }) => (
                                      <li key={message}>{message}</li>
                                    ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        }
                      >
                        <Chip
                          css={{ marginLeft: '12px' }}
                          icon="Warning"
                          size="x-small"
                          type="warning"
                          hideTooltip
                        />
                      </Tooltip>
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
          </CollapsePanel>
        ))}
      </Collapse>

      <PaginationStyled
        itemsPerPage={itemsPerPage}
        setItemPerPage={setItemPerPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </ModelVersionListContainer>
  );
}

const PaginationStyled = styled(Pagination)`
  & {
    position: absolute;
    bottom: 0;
    left: 50%;
    padding-bottom: 10px;
    padding-top: 10px;
    scale: 0.9;
  }
`;

const CollapsePanel = styled(Collapse.Panel)`
  & {
    .rc-collapse-content-box {
      margin-top: 5px;
      margin-bottom: 5px;
    }
  }
`;
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
    css={{
      marginRight: 8,
      transition: 'transform .2s',
      transform: `rotate(${isActive ? 0 : -90}deg)`,
    }}
    type="ChevronDown"
  />
);
