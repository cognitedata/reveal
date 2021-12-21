import { useEffect, useLayoutEffect, Suspense } from 'react';
import { useDispatch } from 'react-redux';

import BasePreviewCard from 'components/card/preview-card';
import { LoaderContainer } from 'components/card/preview-card/elements';
import { WhiteLoaderInline } from 'components/loading';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { clearSelectedWell } from 'modules/map/actions';
import { useMutateWellPatch } from 'modules/wellSearch/hooks/useQueryWellCard';
import { useWellResult } from 'modules/wellSearch/selectors';
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
  const { mutate } = useMutateWellPatch();
  const well = useWellResult(wellId);
  const metrics = useGlobalMetrics('wells');

  const WellIcon = new Image();
  WellIcon.src = wellImage;

  useEffect(() => {
    if (!well) {
      mutate(wellId);
    }
  }, [well, wellId]);

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
        actions={<WellPreviewAction well={well} />}
        icon="OilPlatform"
      >
        <WellMetaDataContainer>
          <WellMetadata well={well} />
        </WellMetaDataContainer>
        <MarginBottomNormalContainer>
          <WellboreCardDetails wellId={wellId} />
        </MarginBottomNormalContainer>
      </BasePreviewCard>
    </Suspense>
  );
};
