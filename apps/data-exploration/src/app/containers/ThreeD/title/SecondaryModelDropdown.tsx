import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Button, Input, Menu, Divider } from '@cognite/cogs.js';

import { Cognite3DViewer } from '@cognite/reveal';
import { Model3D } from '@cognite/sdk';
import styled from 'styled-components';

import {
  Image360DatasetOptions,
  SecondaryModelOptions,
} from '@data-exploration-app/containers/ThreeD/ThreeDContext';
import { MainThreeDModelMenuItem } from '@data-exploration-app/containers/ThreeD/title/MainThreeDModelMenuItem';
import { SecondaryThreeDModelMenuItem } from '@data-exploration-app/containers/ThreeD/title/SecondaryThreeDModelMenuItem';
import { TableNoResults } from '@cognite/cdf-utilities';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { EXPLORATION } from '@data-exploration-app/constants/metrics';
import { Images360MenuItem } from '@data-exploration-app/containers/ThreeD/title/Images360MenuItem';
import {
  DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT,
  Revision3DWithIndex,
  useInfinite360Images,
  ThreeDModelsResponse,
  useInfinite3DModelsQuery,
} from '@data-exploration-lib/domain-layer';
import { SECONDARY_MODEL_DISPLAY_LIMIT } from '../utils';

type SecondaryModelDropdownProps = {
  mainModel?: Model3D;
  mainRevision?: Revision3DWithIndex;
  mainImage360SiteId?: string;
  secondaryModels: SecondaryModelOptions[];
  setSecondaryModels: Dispatch<SetStateAction<SecondaryModelOptions[]>>;
  images360: Image360DatasetOptions[];
  setImages360: Dispatch<SetStateAction<Image360DatasetOptions[]>>;
  viewer: Cognite3DViewer;
};

const SecondaryModelDropdown = ({
  mainModel,
  mainRevision,
  mainImage360SiteId,
  secondaryModels,
  setSecondaryModels,
  images360,
  setImages360,
  viewer,
}: SecondaryModelDropdownProps): JSX.Element => {
  const [numOfModelToDisplay, setNumOfModelToDisplay] = useState<number>(
    SECONDARY_MODEL_DISPLAY_LIMIT
  );
  const [numOfImages360ToDisplay, setNumOfImages360ToDisplay] =
    useState<number>(SECONDARY_MODEL_DISPLAY_LIMIT);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSecondaryModels, setTempSecondaryModels] =
    useState(secondaryModels);
  const [tempCubemap360Images, setTempCubemap360Images] = useState(images360);

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

  const canApplyImages360 = useMemo(
    () =>
      tempCubemap360Images.some(({ applied, siteId }) =>
        images360.some(
          ({ applied: tApplied, siteId: tmId }) =>
            siteId === tmId && applied !== tApplied
        )
      ),
    [images360, tempCubemap360Images]
  );

  const {
    images360Data,
    hasNextPage: canFetchMoreImages360Data,
    fetchNextPage: fetchMoreImages360Data,
    isFetchingNextPage: isFetchingMoreImages360Data,
  } = useInfinite360Images();

  const filteredImages360SiteIds = useMemo(() => {
    return images360Data.filter(
      ({ siteName, siteId }) =>
        siteName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        siteId !== mainImage360SiteId
    );
  }, [images360Data, mainImage360SiteId, searchQuery]);

  const mainImage360Data = useMemo(
    () => images360Data.find((img360) => img360.siteId === mainImage360SiteId),
    [images360Data, mainImage360SiteId]
  );

  const {
    data: modelData = { pages: [] as ThreeDModelsResponse[] },
    fetchNextPage: fetchMore,
    hasNextPage: canFetchMore,
    isFetchingNextPage: isFetchingMore,
  } = useInfinite3DModelsQuery(DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT);

  useEffect(() => {
    if (canFetchMore && !isFetchingMore) {
      fetchMore();
    }
  }, [canFetchMore, fetchMore, isFetchingMore]);

  useEffect(() => {
    if (canFetchMoreImages360Data && !isFetchingMoreImages360Data) {
      fetchMoreImages360Data();
    }
  }, [
    canFetchMoreImages360Data,
    fetchMoreImages360Data,
    isFetchingMoreImages360Data,
  ]);

  const models = useMemo(
    () =>
      modelData.pages
        .reduce((accl, t) => accl.concat(t.items), [] as Model3D[])
        .filter(({ id: tId }) => tId !== mainModel?.id)
        .sort((a, b) =>
          a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())
        ),
    [modelData, mainModel]
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
    if (canApplyImages360) {
      setImages360(tempCubemap360Images);
      trackUsage(EXPLORATION.THREED_ACTION.SECONDARY_IMAGE_360_SELECTED, {
        resourceType: '3D',
      });
    }
  };

  const handleChangeImages360 = (nextState: Image360DatasetOptions): void => {
    setTempCubemap360Images((prevState) => [
      ...prevState.filter(
        ({ siteId: testSiteId }) => nextState.siteId !== testSiteId
      ),
      {
        ...nextState,
      },
    ]);

    if (
      !images360.some((siteDetails) => nextState.siteId === siteDetails.siteId)
    ) {
      setImages360((prevState) => [
        ...prevState,
        {
          ...nextState,
        },
      ]);
    }
  };

  const handleChange = (nextState: SecondaryModelOptions): void => {
    setTempSecondaryModels((prevState) => [
      ...prevState.filter(
        ({ modelId: testModelId }) => nextState.modelId !== testModelId
      ),
      {
        ...nextState,
      },
    ]);

    if (
      // eslint-disable-next-line lodash/prefer-some
      secondaryModels.findIndex(
        ({ modelId: testModelId }) => nextState.modelId === testModelId
      ) === -1 &&
      nextState.revisionId
    ) {
      setSecondaryModels((prevState) => [
        ...prevState,
        {
          ...nextState,
        },
      ]);
    }
  };

  const handleSecondaryModelScroll = (e: any) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const offset = numOfModelToDisplay + SECONDARY_MODEL_DISPLAY_LIMIT;
    // Get next data when 90% of scroll height is reached.
    if (scrollTop + clientHeight >= scrollHeight * 0.9) {
      if (offset < filteredModels.length) {
        setNumOfModelToDisplay(offset);
      }
    }
  };

  const handleImages360Scroll = (e: any) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const offset = numOfImages360ToDisplay + SECONDARY_MODEL_DISPLAY_LIMIT;
    // Get next data when 90% of scroll height is reached.
    if (scrollTop + clientHeight >= scrollHeight * 0.9) {
      if (offset < filteredImages360SiteIds.length) {
        setNumOfImages360ToDisplay(offset);
      }
    }
  };

  return (
    <MenuWrapper>
      <StyledInput
        autoFocus
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search"
        value={searchQuery || ''}
        onKeyDown={(e) => {
          // Need to stop propagation to fix losing focus
          // Check https://github.com/mui/material-ui/issues/19096#issuecomment-570918052
          e.stopPropagation();
        }}
      />
      <MainThreeDModelMenuItem
        model={mainModel}
        image360SiteData={mainImage360Data}
        revision={mainRevision}
      />
      <Divider />
      <StyledSecondaryModelListContainer onScroll={handleImages360Scroll}>
        {viewer && filteredImages360SiteIds.length ? (
          <>
            <Menu.Header>360 Images</Menu.Header>
            {filteredImages360SiteIds
              .slice(0, numOfImages360ToDisplay)
              .map((images360Item) => (
                <Images360MenuItem
                  key={images360Item.siteId}
                  siteId={images360Item.siteId}
                  siteName={images360Item.siteName}
                  options={tempCubemap360Images.find(
                    ({ siteId }) => siteId === images360Item.siteId
                  )}
                  onChange={handleChangeImages360}
                />
              ))}
          </>
        ) : (
          <></>
        )}
      </StyledSecondaryModelListContainer>
      <Divider />
      <StyledSecondaryModelListContainer onScroll={handleSecondaryModelScroll}>
        {viewer && filteredModels.length ? (
          <>
            <Menu.Header>Additional Model</Menu.Header>
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
              title="No results found"
              content={`The search ${searchQuery} did not match any models. Please try another search.`}
            />
          </StyledNoResultsContainer>
        )}
      </StyledSecondaryModelListContainer>
      <Divider />
      <StyledApplyButton
        disabled={!canApply && !canApplyImages360}
        onClick={handleApply}
        type="primary"
      >
        Apply
      </StyledApplyButton>
    </MenuWrapper>
  );
};

const MenuWrapper = styled(Menu)`
  max-height: calc(100vh - 200px);
`;

const StyledSecondaryModelListContainer = styled.div`
  margin: -4px -8px;
  padding: 4px 8px;
  max-height: 30vh;
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
  line-height: 36px;
`;

export default SecondaryModelDropdown;
