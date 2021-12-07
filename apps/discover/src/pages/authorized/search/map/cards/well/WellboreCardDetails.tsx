import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';

import { useTranslation } from '@cognite/react-i18n';

import { PathHeader } from 'components/document-info-panel/elements';
import navigation from 'constants/navigation';
import { wellSearchActions } from 'modules/wellSearch/actions';
import { useWellBoreResult } from 'modules/wellSearch/selectors';
import { InspectWellboreContext } from 'modules/wellSearch/types';
import { FlexColumn } from 'styles/layout';

import { useMutateWellBorePatch } from '../../../../../../modules/wellSearch/hooks/useQueryWellCard';

import { WellboreButton, WellboreRow, WellboreTitle } from './elements';

export const WellboreCardDetails: React.FC<{ wellId: number }> = ({
  wellId,
}) => {
  const wellbore = useWellBoreResult(wellId);
  const dispatch = useDispatch();
  const history = useHistory();
  const { t } = useTranslation('Well');

  const { mutate } = useMutateWellBorePatch([wellId]);

  useEffect(() => {
    if (wellId) {
      mutate();
    } else {
      // Trigger a resize for the map to change width after transition has finished
      window.dispatchEvent(new Event('resize'));
    }
  }, [wellId]);

  const handleClickView = (wellboreId: number) => {
    // setWellCardSelectedWellId
    if (wellId) {
      dispatch(wellSearchActions.setWellCardSelectedWellId(wellId));
      dispatch(wellSearchActions.setWellCardSelectedWellBoreId([wellboreId]));
      dispatch(
        wellSearchActions.setWellboreInspectContext(
          InspectWellboreContext.WELL_CARD_WELLBORES
        )
      );
      history.push(navigation.SEARCH_WELLS_INSPECT);
    }
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
