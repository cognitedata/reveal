import { useMemo, useState } from 'react';
import { Link, useMatch, useNavigate } from 'react-location';
import { useSelector } from 'react-redux';

import styled from 'styled-components/macro';

import { Button, Input, Skeleton } from '@cognite/cogs.js';
import { useGetModelFileListQuery } from '@cognite/simconfig-api-sdk/rtk';

import { ModelDetails, ModelList } from 'components/models';
import { selectProject } from 'store/simconfigApiProperties/selectors';

import type { AppLocationGenerics } from 'routes';

export function ModelLibrary() {
  const project = useSelector(selectProject);
  const {
    params: { modelName, simulator, selectedTab = 'model-versions' },
  } = useMatch<AppLocationGenerics>();

  const { data: modelFiles, isFetching: isFetchingModelFiles } =
    useGetModelFileListQuery({ project });
  const [modelNameFilter, setModelNameFilter] = useState('');
  const navigate = useNavigate();

  const modelFileList = useMemo(
    () =>
      (modelFiles?.modelFileList ?? []).filter((modelFile) => {
        if (modelNameFilter) {
          return modelFile.name.toLowerCase().includes(modelNameFilter);
        }
        return true;
      }),
    [modelFiles?.modelFileList, modelNameFilter]
  );

  if (isFetchingModelFiles) {
    return <Skeleton.List lines={5} />;
  }

  if (!modelName && modelFileList.length) {
    const firstFile = modelFileList[0];
    navigate({
      to: `/model-library/models/${encodeURIComponent(
        firstFile.source
      )}/${encodeURIComponent(firstFile.metadata.modelName)}`,
      replace: true,
    });
  }

  if (!simulator) {
    return null;
  }

  return (
    <ModelLibraryContainer>
      <ModelLibrarySidebar>
        <div className="header">
          <div className="form">
            <Input
              icon="Search"
              maxLength={64}
              name="modelName"
              placeholder="Search models"
              size="small"
              title=""
              fullWidth
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setModelNameFilter(event.target.value.toLocaleLowerCase());
              }}
            />
          </div>
          <div className="new-model">
            <Link to="/model-library/new-model">
              <Button icon="Add" type="primary" block>
                New model
              </Button>
            </Link>
          </div>
        </div>
        <div className="model-list">
          <ModelList modelFiles={modelFileList} />
        </div>
      </ModelLibrarySidebar>
      <ModelLibraryContent>
        <ModelDetails
          modelName={modelName}
          project={project}
          selectedTab={selectedTab}
          simulator={simulator}
        />
      </ModelLibraryContent>
    </ModelLibraryContainer>
  );
}

const ModelLibraryContainer = styled.div`
  display: flex;
  flex: 1 1 0;
  overflow: auto;
`;

const ModelLibrarySidebar = styled.aside`
  display: flex;
  flex-flow: column nowrap;
  flex: 0 1 auto;
  max-width: 400px;
  min-width: 250px;
  .header {
    background: var(--cogs-greyscale-grey1);
    padding: 0 24px;
    box-shadow: 0 0 2px var(--cogs-greyscale-grey5);
    .form {
      font-size: var(--cogs-detail-font-size);
      .cogs-icon {
        width: 12px !important;
      }
      & > div {
        margin: 12px 0;
      }
    }
  }
  .new-model {
    margin-bottom: 12px;
  }
  .model-list {
    padding: 24px;
    padding-top: 12px;
    overflow: auto;
  }
`;

const ModelLibraryContent = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
  overflow: auto;
`;
