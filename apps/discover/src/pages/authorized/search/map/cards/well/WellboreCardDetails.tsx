import { useEffect } from 'react';

import { useTranslation } from '@cognite/react-i18n';

import { PathHeader } from 'components/document-preview/elements';
import { useNavigateToWellInspect } from 'modules/wellInspect/hooks/useNavigateToWellInspect';
import { useWellboresOfWellById } from 'modules/wellSearch/hooks/useWellsCacheQuerySelectors';
import { FlexColumn } from 'styles/layout';

import { WellboreButton, WellboreRow, WellboreTitle } from './elements';

export const WellboreCardDetails: React.FC<{ wellId: number }> = ({
  wellId,
}) => {
  const wellbore = useWellboresOfWellById(wellId);
  const { t } = useTranslation('Well');
  const navigateToWellInspect = useNavigateToWellInspect();

  useEffect(() => {
    if (!wellId) {
      // Trigger a resize for the map to change width after transition has finished
      window.dispatchEvent(new Event('resize'));
    }
  }, [wellId]);

  const handleClickView = (wellboreId: number) => {
    navigateToWellInspect({ wellIds: [wellId], wellboreIds: [wellboreId] });
  };

  return (
    <FlexColumn>
      {wellbore && wellbore.length > 0 && (
        <>
          <PathHeader>{t('Wellbores')}</PathHeader>
          {wellbore?.map((wellbore) => (
            <WellboreRow
              key={wellbore.id}
              onClick={() => handleClickView(wellbore.id)}
            >
              <WellboreTitle>{wellbore.name}</WellboreTitle>
              <WellboreButton
                aria-label="Wellbore button"
                type="ghost"
                icon="ArrowRight"
              />
            </WellboreRow>
          ))}
        </>
      )}
    </FlexColumn>
  );
};
