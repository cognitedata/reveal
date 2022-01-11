import React from 'react';

import map from 'lodash/map';

import { Button, Tooltip } from '@cognite/cogs.js';
import { useTranslation } from '@cognite/react-i18n';

import { FeedbackButton } from 'components/buttons';
import GeneralFeedback from 'components/modals/general-feedback/GeneralFeedback';
import { useNavigateToWellInspect } from 'modules/wellInspect/hooks/useNavigateToWellInspect';
import { useWellboresOfWellById } from 'modules/wellSearch/hooks/useWellsCacheQuerySelectors';
import { Well } from 'modules/wellSearch/types';
import { FlexAlignItems, FlexGrow } from 'styles/layout';

import { ActionContainer } from '../document/components/elements';

import { WellCardAddToFavorites } from './WellCardAddToFavorites';

interface Props {
  well: Well | null;
}

export const WellPreviewAction: React.FC<Props> = (props) => {
  const { well } = props;
  const { t } = useTranslation('Well');
  const wellbores = useWellboresOfWellById(well?.id);
  const navigateToWellInspect = useNavigateToWellInspect();

  const [feedbackIsVisible, setFeedbackIsVisible] =
    React.useState<boolean>(false);

  const handleClickView = () => {
    navigateToWellInspect({
      wellIds: [well?.id],
      wellboreIds: map(wellbores, 'id'),
    });
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
