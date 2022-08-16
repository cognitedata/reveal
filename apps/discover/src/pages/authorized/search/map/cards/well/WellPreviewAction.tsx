import { WellInternal } from 'domain/wells/well/internal/types';

import React from 'react';

import map from 'lodash/map';

import { Button, Tooltip } from '@cognite/cogs.js';
import { reportException } from '@cognite/react-errors';

import { ADD_TO_FAVOURITES } from 'components/AddToFavoriteSetMenu/constants';
import { FeedbackButton } from 'components/Buttons';
import GeneralFeedback from 'components/Modals/general-feedback/GeneralFeedback';
import { useDeepMemo } from 'hooks/useDeep';
import { useTranslation } from 'hooks/useTranslation';
import { FavoriteContentWells } from 'modules/favorite/types';
import { useNavigateToWellInspect } from 'modules/wellInspect/hooks/useNavigateToWellInspect';
import { useWellboresOfWellById } from 'modules/wellSearch/hooks/useWellsCacheQuerySelectors';
import { FavoriteDropdown } from 'pages/authorized/search/common/FavoriteDropdown';
import { FlexAlignItems, FlexGrow } from 'styles/layout';

import { ActionContainer } from '../document/components/elements';

interface Props {
  well: WellInternal | null;
  favoriteWellIds: FavoriteContentWells;
}

export const WellPreviewAction: React.FC<Props> = (props) => {
  const { well, favoriteWellIds } = props;
  const { t } = useTranslation('Well');
  const wellbores = useWellboresOfWellById(well?.id);
  const navigateToWellInspect = useNavigateToWellInspect();

  const [feedbackIsVisible, setFeedbackIsVisible] =
    React.useState<boolean>(false);

  const handleClickView = () => {
    if (!well?.id) {
      reportException('Missing well on well preview');
      return;
    }
    navigateToWellInspect({
      wellIds: [well?.id],
      wellboreIds: map(wellbores, 'id'),
    });
  };

  const isFavored = useDeepMemo(() => {
    if (!favoriteWellIds || !well?.id) {
      return false;
    }

    return Object.keys(favoriteWellIds).includes(well?.id);
  }, [favoriteWellIds, well?.id]);

  return (
    <ActionContainer>
      {well && (
        <Tooltip content={t(ADD_TO_FAVOURITES) as string} placement="top">
          <FavoriteDropdown isFavored={isFavored} well={{ [well.id]: [] }} />
        </Tooltip>
      )}
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
