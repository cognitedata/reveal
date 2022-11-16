import React, { useEffect, useMemo, useState } from 'react';

import { createLink, PageTitle, SecondaryTopbar } from '@cognite/cdf-utilities';
import { Button, Input, Menu } from '@cognite/cogs.js';
import {
  ThreeDModelsResponse,
  useInfinite3DModels,
} from '@cognite/data-exploration';
import { Model3D } from '@cognite/sdk';
import { Alert } from 'antd';
import { isEqual } from 'lodash';
import styled from 'styled-components';

import {
  use3DModel,
  useDefault3DModelRevision,
  useRevisionIndex,
} from 'app/containers/ThreeD/hooks';
import { MainThreeDModelMenuItem } from 'app/containers/ThreeD/title/MainThreeDModelMenuItem';
import { SecondaryThreeDModelMenuItem } from 'app/containers/ThreeD/title/SecondaryThreeDModelMenuItem';

export type SecondaryModelState = {
  [modelId: number]: {
    revisionId?: number;
    selected?: boolean;
  };
};

export const ThreeDTitle = ({ id }: { id: number }): JSX.Element => {
  const { data: apiThreeDModel, error: modelError, isSuccess } = use3DModel(id);
  const { data: revision, error: revisionError } = useDefault3DModelRevision(
    id,
    {
      enabled: isSuccess,
    }
  );
  const { data: revisionIndex } = useRevisionIndex(id, revision?.id!, {
    enabled: !!revision?.id,
  });

  const goBackFallback = createLink('/explore/search/threeD');

  const [appliedSecondaryModelState, setAppliedSecondaryModelState] =
    useState<SecondaryModelState>({});
  const [tempSecondaryModelState, setTempSecondaryModelState] =
    useState<SecondaryModelState>({});
  const [searchQuery, setSearchQuery] = useState('');

  const canApply = !isEqual(
    appliedSecondaryModelState,
    tempSecondaryModelState
  );

  const {
    data: modelData = { pages: [] as ThreeDModelsResponse[] },
    fetchNextPage: fetchMore,
    hasNextPage: canFetchMore,
    isFetchingNextPage: isFetchingMore,
  } = useInfinite3DModels();

  useEffect(() => {
    if (canFetchMore && !isFetchingMore) {
      fetchMore();
    }
  }, [canFetchMore, fetchMore, isFetchingMore]);

  const models = useMemo(
    () =>
      modelData.pages
        .reduce((accl, t) => accl.concat(t.items), [] as Model3D[])
        .filter(({ id: testId }) => testId !== id)
        .sort((a, b) =>
          a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())
        ),
    [id, modelData]
  );

  const filteredModels = useMemo(() => {
    return models.filter(({ name }) =>
      name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [models, searchQuery]);

  const handleApply = (): void => {
    setAppliedSecondaryModelState({ ...tempSecondaryModelState });
  };

  const handleModelStateChange = (
    modelId: number,
    nextState: SecondaryModelState[number]
  ): void => {
    setTempSecondaryModelState(prevState => ({
      ...prevState,
      [modelId]: nextState,
    }));

    if (!appliedSecondaryModelState[modelId]) {
      setAppliedSecondaryModelState(prevState => ({
        ...prevState,
        [modelId]: nextState,
      }));
    }
  };

  const error = modelError || revisionError;
  if (error) {
    return (
      <>
        <PageTitle title={id.toString()} />
        <SecondaryTopbar
          goBackFallback={goBackFallback}
          title={id.toString()}
        />
        <Alert type="error" message="Error" description={`${error}`} />
      </>
    );
  }

  return (
    <>
      <PageTitle title={apiThreeDModel?.name} />
      <SecondaryTopbar
        goBackFallback={goBackFallback}
        title={apiThreeDModel?.name || id.toString()}
        subtitle={
          revisionIndex && Number.isFinite(revisionIndex)
            ? `Revision ${revisionIndex}`
            : undefined
        }
        dropdownProps={
          filteredModels && {
            content: (
              <Menu>
                <Input
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  value={searchQuery}
                />
                <Menu.Header>Main Model</Menu.Header>
                {apiThreeDModel && revision && (
                  <MainThreeDModelMenuItem
                    model={apiThreeDModel}
                    revision={revision}
                  />
                )}
                <Menu.Divider />
                <StyledSecondaryModelListContainer>
                  <Menu.Header>Secondary Model</Menu.Header>
                  {filteredModels.length ? (
                    filteredModels.map(m => (
                      <SecondaryThreeDModelMenuItem
                        key={m.id}
                        model={m}
                        state={tempSecondaryModelState[m.id]}
                        setState={nextState => {
                          handleModelStateChange(m.id, nextState);
                        }}
                      />
                    ))
                  ) : (
                    <Menu.Item disabled>No model found</Menu.Item>
                  )}
                </StyledSecondaryModelListContainer>
                <Menu.Divider />
                <StyledApplyButton
                  disabled={!canApply}
                  onClick={handleApply}
                  type="primary"
                >
                  Apply
                </StyledApplyButton>
              </Menu>
            ),
          }
        }
        extraContent={
          revision
            ? `Updated: ${revision.createdTime.toLocaleDateString()}`
            : undefined
        }
      />
    </>
  );
};

const StyledSecondaryModelListContainer = styled.div`
  margin: -4px -8px;
  padding: 4px 8px;
  max-height: 60vh;
  overflow-y: auto;
`;

const StyledApplyButton = styled(Button)`
  margin-top: 4px;
`;
