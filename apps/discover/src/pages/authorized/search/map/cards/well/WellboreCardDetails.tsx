import { useEffect } from 'react';

import { PathHeader } from 'components/DocumentPreview/elements';
import { useTranslation } from 'hooks/useTranslation';
import { FavoriteContentWells } from 'modules/favorite/types';
import { useNavigateToWellInspect } from 'modules/wellInspect/hooks/useNavigateToWellInspect';
import { useWellboresOfWellById } from 'modules/wellSearch/hooks/useWellsCacheQuerySelectors';
import { WellboreId, WellId } from 'modules/wellSearch/types';
import { FlexColumn } from 'styles/layout';

import { WellboreRow, WellboreTitle } from './elements';
import { WellboreDetailIcon } from './WellboreDetailIcon';

export const WellboreCardDetails: React.FC<{
  wellId: WellId;
  favoriteWellIds: FavoriteContentWells;
}> = ({ wellId, favoriteWellIds }) => {
  const wellbores = useWellboresOfWellById(wellId);
  const { t } = useTranslation('Well');
  const navigateToWellInspect = useNavigateToWellInspect();

  useEffect(() => {
    if (!wellId) {
      // Trigger a resize for the map to change width after transition has finished
      window.dispatchEvent(new Event('resize'));
    }
  }, [wellId]);

  const handleClickView = (wellboreId: WellboreId) => {
    navigateToWellInspect({ wellIds: [wellId], wellboreIds: [wellboreId] });
  };

  return (
    <FlexColumn>
      {wellbores && wellbores.length > 0 && (
        <>
          <PathHeader>{t('Wellbores')}</PathHeader>
          {wellbores?.map((wellbore) => (
            <WellboreRow key={wellbore.id}>
              <WellboreTitle>{wellbore.name}</WellboreTitle>
              <WellboreDetailIcon
                favoriteWellIds={favoriteWellIds}
                wellId={wellId}
                wellboreId={wellbore.id}
                navigateInspect={handleClickView}
              />
            </WellboreRow>
          ))}
        </>
      )}
    </FlexColumn>
  );
};
