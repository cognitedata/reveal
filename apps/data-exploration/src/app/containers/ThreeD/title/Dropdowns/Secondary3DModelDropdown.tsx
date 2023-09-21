import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';

import styled from 'styled-components';

import { TableNoResults } from '@cognite/cdf-utilities';
import { Button, Input, Menu } from '@cognite/cogs.js';
import { Model3D } from '@cognite/sdk';

import { useTranslation } from '@data-exploration-lib/core';
import {
  DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT,
  ThreeDModelsResponse,
  useInfinite3DModelsQuery,
} from '@data-exploration-lib/domain-layer';

import { EXPLORATION } from '../../../../constants/metrics';
import { trackUsage } from '../../../../utils/Metrics';
import { SecondaryModelOptions } from '../../contexts/ThreeDContext';
import { SECONDARY_MODEL_DISPLAY_LIMIT } from '../../utils';
import { SecondaryThreeDModelMenuItem } from '../MenuItems/SecondaryThreeDModelMenuItem';

type Secondary3DModelDropdownProps = {
  mainModel?: Model3D;
  secondaryModels: SecondaryModelOptions[];
  setSecondaryModels: Dispatch<SetStateAction<SecondaryModelOptions[]>>;
};

const Secondary3DModelDropdown = ({
  mainModel,
  secondaryModels,
  setSecondaryModels,
}: Secondary3DModelDropdownProps): JSX.Element => {
  const { t } = useTranslation();
  const [numOfModelToDisplay, setNumOfModelToDisplay] = useState<number>(
    SECONDARY_MODEL_DISPLAY_LIMIT
  );
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
    isFetching: isFetchingModels,
  } = useInfinite3DModelsQuery(DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT);

  useEffect(() => {
    if (canFetchMore && !isFetchingMore) {
      fetchMore();
    }
  }, [canFetchMore, fetchMore, isFetchingMore]);

  const models = useMemo(
    () =>
      modelData.pages
        .reduce((accl, res) => accl.concat(res.items), [] as Model3D[])
        .filter(({ id: tId }) => tId !== mainModel?.id)
        .sort((m1, m2) => {
          const isModel1Applied = secondaryModels.find(
            (mod) => mod.modelId === m1.id
          )?.applied;
          const isModel2Applied = secondaryModels.find(
            (mod) => mod.modelId === m2.id
          )?.applied;

          // This is added so that models that are applied are shown first
          if (isModel1Applied && !isModel2Applied) return -1;
          if (!isModel1Applied && isModel2Applied) return 1;

          return m1.name
            .toLocaleLowerCase()
            .localeCompare(m2.name.toLocaleLowerCase());
        }),
    [modelData, mainModel, secondaryModels]
  );

  const filteredModels = useMemo(() => {
    return models.filter(({ name }) =>
      name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [models, searchQuery]);

  const handleApply = (): void => {
    if (canApply) {
      setSecondaryModels(tempSecondaryModels);
      trackUsage(EXPLORATION.THREED_ACTION.SECONDARY_MODEL_SELECTED, {
        resourceType: '3D',
      });
    }
  };

  const handleChange = (nextState: SecondaryModelOptions): void => {
    setTempSecondaryModels((prevState) => [
      ...prevState.filter(
        ({ modelId: testModelId }) => nextState.modelId !== testModelId
      ),
      nextState,
    ]);

    if (
      // eslint-disable-next-line lodash/prefer-some
      secondaryModels.findIndex(
        ({ modelId: testModelId }) => nextState.modelId === testModelId
      ) === -1 &&
      nextState.revisionId
    ) {
      setSecondaryModels((prevState) => [...prevState, nextState]);
    }
  };

  const handleSecondaryModelScroll = (e: any) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Get next data when 90% of scroll height is reached.
    if (scrollTop + clientHeight >= scrollHeight * 0.9) {
      if (numOfModelToDisplay < filteredModels.length) {
        setNumOfModelToDisplay(
          numOfModelToDisplay + SECONDARY_MODEL_DISPLAY_LIMIT
        );
      }
    }
  };

  return (
    <MenuWrapper loading={isFetchingModels && models.length === 0}>
      <StyledFooter>
        <StyledInput
          autoFocus
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('SEARCH', 'Search')}
          value={searchQuery || ''}
          onKeyDown={(e) => {
            // Need to stop propagation to fix losing focus
            // Check https://github.com/mui/material-ui/issues/19096#issuecomment-570918052
            e.stopPropagation();
          }}
        />
      </StyledFooter>
      <StyledSecondaryObjectListContainer onScroll={handleSecondaryModelScroll}>
        {filteredModels.length ? (
          <>
            {filteredModels.slice(0, numOfModelToDisplay).map((model) => (
              <SecondaryThreeDModelMenuItem
                key={model.id}
                model={model}
                options={tempSecondaryModels.find(
                  ({ modelId }) => modelId === model.id
                )}
                onChange={handleChange}
              />
            ))}
          </>
        ) : (
          <StyledNoResultsContainer>
            <TableNoResults
              title={t('NO_RESULTS_FOUND', 'No results found')}
              content={t(
                'NO_MODELS_FOUND_TRY_ANOTHER_SEARCH',
                `The search ${searchQuery} did not match any models. Please try another search.`,
                {
                  query: searchQuery,
                }
              )}
            />
          </StyledNoResultsContainer>
        )}
      </StyledSecondaryObjectListContainer>
      <StyledApplyButton
        disabled={!canApply}
        onClick={handleApply}
        type="primary"
      >
        {t('APPLY', 'Apply')}
      </StyledApplyButton>
    </MenuWrapper>
  );
};

export const StyledFooter = styled(Menu.Footer)`
  padding: 0;
`;

export const MenuWrapper = styled(Menu)`
  max-height: calc(100vh - 200px);
  min-width: 320px;
  max-width: 320px;
`;

export const StyledSecondaryObjectListContainer = styled(Menu)`
  margin: -4px -8px;
  padding: 4px 8px;
  max-height: 30vh;
  overflow-y: auto;
  border: 0px;
  border-radius: 0px;
  box-shadow: none;
`;

export const StyledApplyButton = styled(Button)`
  margin-top: 4px;
`;

export const StyledNoResultsContainer = styled.div`
  margin: 4px 0;
  width: 100%;
`;

export const StyledInput = styled(Input)`
  margin-bottom: 8px;
  line-height: 36px;
  width: 100%;
`;

export default Secondary3DModelDropdown;
