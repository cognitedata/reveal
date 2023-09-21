import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

import { TableNoResults } from '@cognite/cdf-utilities';

import { useTranslation } from '@data-exploration-lib/core';
import { useInfinite360Images } from '@data-exploration-lib/domain-layer';

import { EXPLORATION } from '../../../../constants/metrics';
import { trackUsage } from '../../../../utils/Metrics';
import { Image360DatasetOptions } from '../../contexts/ThreeDContext';
import { SECONDARY_MODEL_DISPLAY_LIMIT } from '../../utils';
import { Images360MenuItem } from '../MenuItems/Images360MenuItem';

import {
  MenuWrapper,
  StyledApplyButton,
  StyledFooter,
  StyledInput,
  StyledNoResultsContainer,
  StyledSecondaryObjectListContainer,
} from './Secondary3DModelDropdown';

type SecondaryImages360DropdownProps = {
  mainImage360SiteId?: string;
  images360: Image360DatasetOptions[];
  setImages360: Dispatch<SetStateAction<Image360DatasetOptions[]>>;
};

const SecondaryImages360Dropdown = ({
  mainImage360SiteId,
  images360,
  setImages360,
}: SecondaryImages360DropdownProps): JSX.Element => {
  const { t } = useTranslation();
  const [numOfImages360ToDisplay, setNumOfImages360ToDisplay] =
    useState<number>(SECONDARY_MODEL_DISPLAY_LIMIT);
  const [searchQuery, setSearchQuery] = useState('');

  const [tempCubemap360Images, setTempCubemap360Images] = useState(images360);

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
    isFetching: isFetchingImages360Data,
  } = useInfinite360Images();

  const filteredImages360SiteIds = useMemo(() => {
    return images360Data
      .sort((img1, img2) => {
        const isImage1Applied = images360.find(
          (img) => img.siteId === img1.siteId
        )?.applied;
        const isImage2Applied = images360.find(
          (img) => img.siteId === img2.siteId
        )?.applied;

        if (isImage1Applied && !isImage2Applied) return -1;
        if (!isImage1Applied && isImage2Applied) return 1;

        return img1.siteName
          .toLocaleLowerCase()
          .localeCompare(img2.siteName.toLocaleLowerCase());
      })
      .filter(
        ({ siteName, siteId }) =>
          siteName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          siteId !== mainImage360SiteId
      );
  }, [images360Data, mainImage360SiteId, searchQuery, images360]);

  useEffect(() => {
    if (canFetchMoreImages360Data && !isFetchingMoreImages360Data) {
      fetchMoreImages360Data();
    }
  }, [
    canFetchMoreImages360Data,
    fetchMoreImages360Data,
    isFetchingMoreImages360Data,
  ]);

  const handleApply = (): void => {
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
      nextState,
    ]);

    if (
      !images360.some((siteDetails) => nextState.siteId === siteDetails.siteId)
    ) {
      setImages360((prevState) => [...prevState, nextState]);
    }
  };

  const handleImages360Scroll = (e: any) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Get next data when 90% of scroll height is reached.
    if (scrollTop + clientHeight >= scrollHeight * 0.9) {
      if (numOfImages360ToDisplay < filteredImages360SiteIds.length) {
        setNumOfImages360ToDisplay(
          numOfImages360ToDisplay + SECONDARY_MODEL_DISPLAY_LIMIT
        );
      }
    }
  };

  return (
    <MenuWrapper
      loading={isFetchingImages360Data && images360Data.length === 0}
    >
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
      <StyledSecondaryObjectListContainer onScroll={handleImages360Scroll}>
        {filteredImages360SiteIds.length ? (
          <>
            {filteredImages360SiteIds
              .slice(0, numOfImages360ToDisplay)
              .map((images360Item) => (
                <Images360MenuItem
                  key={images360Item.siteId}
                  siteId={images360Item.siteId}
                  siteName={images360Item.siteName}
                  imageCount={images360Item.numberOfImages}
                  options={tempCubemap360Images.find(
                    ({ siteId }) => siteId === images360Item.siteId
                  )}
                  onChange={handleChangeImages360}
                />
              ))}
          </>
        ) : (
          <StyledNoResultsContainer>
            <TableNoResults
              title={t('NO_RESULTS_FOUND', 'No results found')}
              content={t(
                'NO_360_IMAGES_FOUND_TRY_ANOTHER_SEARCH',
                `The search ${searchQuery} did not match any 360 images. Please try another search.`,
                {
                  query: searchQuery,
                }
              )}
            />
          </StyledNoResultsContainer>
        )}
      </StyledSecondaryObjectListContainer>
      <StyledApplyButton
        disabled={!canApplyImages360}
        onClick={handleApply}
        type="primary"
      >
        {t('APPLY', 'Apply')}
      </StyledApplyButton>
    </MenuWrapper>
  );
};

export default SecondaryImages360Dropdown;
