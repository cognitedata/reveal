import { useLayoutEffect, Suspense } from 'react';
import { useDispatch } from 'react-redux';

import { useFavoriteWellIds } from 'services/favorites/hooks/useFavoriteWellIds';

import BasePreviewCard from 'components/card/preview-card';
import { LoaderContainer } from 'components/card/preview-card/elements';
import { WhiteLoaderInline } from 'components/loading';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { clearSelectedWell } from 'modules/map/actions';
import { useWellById } from 'modules/wellSearch/hooks/useWellsCacheQuerySelectors';
import { MarginBottomNormalContainer } from 'styles/layout';

import { wellImage } from '../../icons/well';

import { WellMetaDataContainer } from './elements';
import { WellboreCardDetails } from './WellboreCardDetails';
import { WellMetadata } from './WellMetadata';
import { WellPreviewAction } from './WellPreviewAction';

export const WellPreviewCard: React.FC<{
  wellId: number;
  onPopupClose?: () => void;
}> = ({ wellId, onPopupClose }) => {
  const dispatch = useDispatch();
  const well = useWellById(wellId);
  const metrics = useGlobalMetrics('wells');
  const favoriteWellIds = useFavoriteWellIds();

  const WellIcon = new Image();
  WellIcon.src = wellImage;

  useLayoutEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, []);

  const handlePreviewClose = () => {
    metrics.track('click-close-well-preview-button');

    dispatch(clearSelectedWell());

    if (onPopupClose) {
      onPopupClose();
    }
  };

  return (
    <Suspense
      fallback={
        <BasePreviewCard title="">
          <LoaderContainer>
            <WhiteLoaderInline />
          </LoaderContainer>
        </BasePreviewCard>
      }
    >
      <BasePreviewCard
        title={well?.name || ''}
        handleCloseClick={handlePreviewClose}
        actions={
          <WellPreviewAction well={well} favoriteWellIds={favoriteWellIds} />
        }
        icon="OilPlatform"
      >
        <WellMetaDataContainer>
          <WellMetadata well={well} />
        </WellMetaDataContainer>
        <MarginBottomNormalContainer>
          <WellboreCardDetails
            wellId={wellId}
            favoriteWellIds={favoriteWellIds}
          />
        </MarginBottomNormalContainer>
      </BasePreviewCard>
    </Suspense>
  );
};
