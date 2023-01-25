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

import {
  CubemapDatasetOptions,
  SecondaryModelOptions,
} from '@data-exploration-app/containers/ThreeD/ThreeDContext';
import { MainThreeDModelMenuItem } from '@data-exploration-app/containers/ThreeD/title/MainThreeDModelMenuItem';
import { SecondaryThreeDModelMenuItem } from '@data-exploration-app/containers/ThreeD/title/SecondaryThreeDModelMenuItem';
import {
  Revision3DWithIndex,
  useInfinite360Images,
} from '@data-exploration-app/containers/ThreeD/hooks';
import { TableNoResults } from '@cognite/cdf-utilities';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { EXPLORATION } from '@data-exploration-app/constants/metrics';
import { Images360MenuItem } from '@data-exploration-app/containers/ThreeD/title/Images360MenuItem';

type SecondaryModelDropdownProps = {
  mainModel?: Model3D;
  mainRevision?: Revision3DWithIndex;
  mainImage360SiteId?: string;
  secondaryModels: SecondaryModelOptions[];
  setSecondaryModels: Dispatch<SetStateAction<SecondaryModelOptions[]>>;
  cubemap360Images: CubemapDatasetOptions[];
  setCubemap360Images: Dispatch<SetStateAction<CubemapDatasetOptions[]>>;
  viewer: Cognite3DViewer;
};

const SecondaryModelDropdown = ({
  mainModel,
  mainRevision,
  mainImage360SiteId,
  secondaryModels,
  setSecondaryModels,
  cubemap360Images,
  setCubemap360Images,
  viewer,
}: SecondaryModelDropdownProps): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSecondaryModels, setTempSecondaryModels] =
    useState(secondaryModels);
  const [tempCubemap360Images, setTempCubemap360Images] =
    useState(cubemap360Images);

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
        cubemap360Images.some(
          ({ applied: tApplied, siteId: tmId }) =>
            siteId === tmId && applied !== tApplied
        )
      ),
    [cubemap360Images, tempCubemap360Images]
  );

  const cubemapSiteIds = useInfinite360Images();

  const filteredCubemapSiteIds = useMemo(() => {
    return cubemapSiteIds.filter(
      ({ siteName, siteId }) =>
        siteName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        siteId !== mainImage360SiteId
    );
  }, [cubemapSiteIds, searchQuery]);

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
      trackUsage(EXPLORATION.CLICK.APPLY_MODEL, {
        resourceType: '3D',
      });
    }
    if (canApplyImages360) {
      setCubemap360Images(tempCubemap360Images);
    }
  };

  const handleChangeImages360 = (nextState: CubemapDatasetOptions): void => {
    setTempCubemap360Images((prevState) => [
      ...prevState.filter(
        ({ siteId: testSiteId }) => nextState.siteId !== testSiteId
      ),
      {
        ...nextState,
      },
    ]);

    if (
      !cubemap360Images.some(
        (siteDetails) => nextState.siteId === siteDetails.siteId
      )
    ) {
      setCubemap360Images((prevState) => [
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

  return (
    <MenuWrapper>
      <StyledInput
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search"
        value={searchQuery}
      />
      {mainModel && mainRevision && (
        <MainThreeDModelMenuItem model={mainModel} revision={mainRevision} />
      )}
      <Menu.Divider />
      <StyledSecondaryModelListContainer>
        {viewer && filteredCubemapSiteIds.length ? (
          <>
            <Menu.Header>360 Images</Menu.Header>
            {filteredCubemapSiteIds.map((cubemap) => (
              <Images360MenuItem
                key={cubemap.siteId}
                siteId={cubemap.siteId}
                siteName={cubemap.siteName}
                options={
                  tempCubemap360Images.find(
                    ({ siteId }) => siteId === cubemap.siteId
                  )!
                }
                onChange={handleChangeImages360}
              />
            ))}
          </>
        ) : (
          <></>
        )}
      </StyledSecondaryModelListContainer>
      <Menu.Divider />
      <StyledSecondaryModelListContainer>
        {viewer && filteredModels.length ? (
          <>
            <Menu.Header>Additional Model</Menu.Header>
            {filteredModels.map((model) => (
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
      <Menu.Divider />
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
`;

export default SecondaryModelDropdown;
