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

import type { AppLocationGenerics } from 'routes';

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

  const {
    data: { definitions },
  } = useMatch<AppLocationGenerics>();

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
        {data?.modelFileList.map((modelFile, index) => (
          <Collapse.Panel
            extra={
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
            }
            header={
              <div className="version-header">
                <Label size="small" variant="unknown">
                  v{modelFile.metadata.version}
                </Label>
                <span className="description">
                  {modelFile.metadata.description || '(no description)'}
                </span>
                {modelFile.metadata.errorMessage && (
                  <Label size="small" variant="danger">
                    Error
                  </Label>
                )}
                {modelFile.metadata.modelType && (
                  <Label size="small" variant="default">
                    {definitions?.type.model[modelFile.metadata.modelType]}
                  </Label>
                )}
                {!index && <Label size="small">latest version</Label>}
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

const ModelVersionListContainer = styled.div`
  .version-header {
    display: flex;
    column-gap: 6px;
  }
  .rc-collapse-header {
    padding: 12px !important;
  }
  .rc-collapse-extra {
    display: flex;
    align-items: center;
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
