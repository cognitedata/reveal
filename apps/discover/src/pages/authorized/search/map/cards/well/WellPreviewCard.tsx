import { useFavoriteWellIds } from 'domain/favorites/internal/hooks/useFavoriteWellIds';

import { useLayoutEffect, Suspense } from 'react';
import { useDispatch } from 'react-redux';

import { Collapse } from '@cognite/cogs.js';

import BasePreviewCard from 'components/Card/PreviewCard';
import { LoaderContainer } from 'components/Card/PreviewCard/elements';
import { WhiteLoaderInline } from 'components/Loading';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { clearSelectedWell } from 'modules/map/actions';
import { useWellById } from 'modules/wellSearch/hooks/useWellsCacheQuerySelectors';
import { WellId } from 'modules/wellSearch/types';

import { PathHeader } from '../../../../../../components/DocumentPreview/elements';
import { useProjectConfigByKey } from '../../../../../../hooks/useProjectConfig';
import { wellImage } from '../../icons/well';

import { WellMetaDataContainer } from './elements';
import { WellAdditionalMetadata } from './WellAdditionalMetadata';
import { WellboreCardDetails } from './WellboreCardDetails';
import { WellMetadata } from './WellMetadata';
import { WellPreviewAction } from './WellPreviewAction';

export const WellPreviewCard: React.FC<{
  wellId: WellId;
  onPopupClose?: () => void;
}> = ({ wellId, onPopupClose }) => {
  const dispatch = useDispatch();
  const well = useWellById(wellId);
  const metrics = useGlobalMetrics('wells');
  const favoriteWellIds = useFavoriteWellIds();
  const { data: mapConfig } = useProjectConfigByKey('map');

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
        <WellboreCardDetails
          wellId={wellId}
          favoriteWellIds={favoriteWellIds}
        />
        {mapConfig?.showAdditionalMetadataForWellHeads && well && (
          <Collapse ghost accordion>
            <Collapse.Panel
              header={<PathHeader>Additional metadata</PathHeader>}
              style={{ maxHeight: '400px', overflow: 'auto' }}
            >
              <WellMetaDataContainer>
                <WellAdditionalMetadata well={well} />
              </WellMetaDataContainer>
            </Collapse.Panel>
          </Collapse>
        )}
      </BasePreviewCard>
    </Suspense>
  );
};
