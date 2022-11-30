import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Button, Input, Menu } from '@cognite/cogs.js';
import {
  ThreeDModelsResponse,
  useInfinite3DModels,
} from '@cognite/data-exploration';
import { Cognite3DViewer } from '@cognite/reveal';
import { Model3D } from '@cognite/sdk';
import styled from 'styled-components';

import { SecondaryModelOptions } from 'app/containers/ThreeD/ThreeDContext';
import { MainThreeDModelMenuItem } from 'app/containers/ThreeD/title/MainThreeDModelMenuItem';
import { SecondaryThreeDModelMenuItem } from 'app/containers/ThreeD/title/SecondaryThreeDModelMenuItem';
import { Revision3DWithIndex } from 'app/containers/ThreeD/hooks';
import { TableNoResults } from '@cognite/cdf-utilities';
import { trackUsage } from 'app/utils/Metrics';
import { EXPLORATION } from 'app/constants/metrics';

type SecondaryModelDropdownProps = {
  mainModel: Model3D;
  mainRevision: Revision3DWithIndex;
  secondaryModels: SecondaryModelOptions[];
  setSecondaryModels: Dispatch<SetStateAction<SecondaryModelOptions[]>>;
  viewer: Cognite3DViewer;
};

const SecondaryModelDropdown = ({
  mainModel,
  mainRevision,
  secondaryModels,
  setSecondaryModels,
  viewer,
}: SecondaryModelDropdownProps): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSecondaryModels, setTempSecondaryModels] =
    useState(secondaryModels);

  const canApply = useMemo(
    () =>
      tempSecondaryModels.some(({ applied, modelId, revisionId }) =>
        secondaryModels.some(
          ({ applied: tApplied, modelId: tmId, revisionId: trId }) =>
            modelId === tmId && (revisionId !== trId || applied !== tApplied)
        )
      ),
    [secondaryModels, tempSecondaryModels]
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
        .filter(({ id: tId }) => tId !== mainModel.id)
        .sort((a, b) =>
          a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())
        ),
    [modelData, mainModel.id]
  );

  const filteredModels = useMemo(() => {
    return models.filter(({ name }) =>
      name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [models, searchQuery]);

  const handleApply = (): void => {
    setSecondaryModels([...tempSecondaryModels]);
    trackUsage(EXPLORATION.CLICK.APPLY_MODEL, {
      resourceType: '3D',
    });
  };

  const handleChange = (nextState: SecondaryModelOptions): void => {
    setTempSecondaryModels(prevState => [
      ...prevState.filter(
        ({ modelId: testModelId }) => nextState.modelId !== testModelId
      ),
      {
        ...nextState,
      },
    ]);

    if (
      secondaryModels.findIndex(
        ({ modelId: testModelId }) => nextState.modelId === testModelId
      ) === -1 &&
      nextState.revisionId
    ) {
      setSecondaryModels(prevState => [
        ...prevState,
        {
          ...nextState,
        },
      ]);
    }
  };

  return (
    <Menu>
      <StyledInput
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="Search"
        value={searchQuery}
      />
      {mainModel && mainRevision && (
        <MainThreeDModelMenuItem model={mainModel} revision={mainRevision} />
      )}
      <Menu.Divider />
      <StyledSecondaryModelListContainer>
        {viewer && filteredModels.length ? (
          <>
            <Menu.Header>Additional Model</Menu.Header>
            {filteredModels.map(m => (
              <SecondaryThreeDModelMenuItem
                key={m.id}
                model={m}
                options={tempSecondaryModels.find(
                  ({ modelId }) => modelId === m.id
                )}
                onChange={handleChange}
              />
            ))}
          </>
        ) : (
          <StyledNoResultsContainer>
            <TableNoResults
              title="No results found"
              content={`The search ${searchQuery} did not match any models. Please try another search.`}
            />
          </StyledNoResultsContainer>
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

const StyledNoResultsContainer = styled.div`
  margin: 4px 0;
`;

const StyledInput = styled(Input)`
  margin-bottom: 8px;
`;

export default SecondaryModelDropdown;
