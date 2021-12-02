import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';

import { Button, Tooltip } from '@cognite/cogs.js';
import { useTranslation } from '@cognite/react-i18n';

import { FeedbackButton } from 'components/buttons';
import GeneralFeedback from 'components/modals/general-feedback/GeneralFeedback';
import navigation from 'constants/navigation';
import { wellSearchActions } from 'modules/wellSearch/actions';
import { useWellBoreResult } from 'modules/wellSearch/selectors';
import { InspectWellboreContext, Well } from 'modules/wellSearch/types';
import { FlexAlignItems, FlexGrow } from 'styles/layout';

import { ActionContainer } from '../document/components/elements';

import { WellCardAddToFavorites } from './WellCardAddToFavorites';

interface Props {
  well: Well | null;
  // handlePreviewClick?: () => void;
  // handleViewClick?: () => void;
  // isPreviewButtonDisabled?: boolean;
}

export const WellPreviewAction: React.FC<Props> = (props) => {
  const { well } = props;
  const { t } = useTranslation('Well');
  const wellbore = useWellBoreResult(well?.id);
  const dispatch = useDispatch();
  const history = useHistory();

  const [feedbackIsVisible, setFeedbackIsVisible] =
    React.useState<boolean>(false);

  const handleClickView = () => {
    // set selected well id and all the wellbore ids of the card
    dispatch(wellSearchActions.setWellCardSelectedWellId(well?.id || 0));
    dispatch(
      wellSearchActions.setWellCardSelectedWellBoreId(
        wellbore?.map((wellbore) => wellbore.id) || []
      )
    );
    dispatch(
      wellSearchActions.setWellboreInspectContext(
        InspectWellboreContext.WELL_CARD_WELLBORES
      )
    );
    // navigate to inspect panel
    history.push(navigation.SEARCH_WELLS_INSPECT);
  };

  return (
    <ActionContainer>
      <Tooltip content={t('Add to Favourites') as string} placement="top">
        <WellCardAddToFavorites well={well} />
      </Tooltip>
      <FeedbackButton
        onClick={() => setFeedbackIsVisible(true)}
        data-testid="well-button-feedback"
      />
      <FlexGrow />
      <FlexAlignItems>
        <Button
          style={{ padding: '4px 8px' }}
          type="primary"
          variant="default"
          data-testid="well-button-view"
          disabled={!well}
          onClick={handleClickView}
        >
          View
        </Button>
      </FlexAlignItems>

      <GeneralFeedback
        visible={feedbackIsVisible}
        onCancel={() => setFeedbackIsVisible(false)}
      />
    </ActionContainer>
  );
};
