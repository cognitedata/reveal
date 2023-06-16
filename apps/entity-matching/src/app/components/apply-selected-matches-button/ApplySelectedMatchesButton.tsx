import styled from 'styled-components';

import { useTranslation } from '@entity-matching-app/common/i18n';
import { SourceType } from '@entity-matching-app/types/api';

import { notification } from '@cognite/cdf-utilities';
import { Button, Flex } from '@cognite/cogs.js';

import { Prediction } from '@entity-matching-app/hooks/entity-matching-predictions';
import { useUpdateAssetIds } from '@entity-matching-app/hooks/update';

type Props = {
  predictionJobId: number;
  predictions: Prediction[] | undefined;
  confirmedPredictions: number[] | undefined;
  sourceType: SourceType;
};

const ApplySelectedMatchesButton = ({
  predictionJobId,
  predictions,
  confirmedPredictions,
  sourceType,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const { mutate, isLoading } = useUpdateAssetIds(predictionJobId);

  const selectedPredictions = predictions?.filter((prediction) =>
    confirmedPredictions?.includes(prediction.source.id)
  );

  const applySelected = () => {
    if (selectedPredictions) {
      mutate(
        {
          api: sourceType,
          changes: selectedPredictions.map(({ source, match }) => ({
            id: source.id,
            update: {
              assetId: { set: match.target.id },
            },
          })),
        },
        {
          onSuccess: () => {
            notification.success({
              message: t('notification-success'),
              description: t('save-to-cdf-success'),
            });
          },
          onError: () => {
            notification.error({
              message: t('error'),
              description: t('save-to-cdf-error'),
            });
          },
        }
      );
    }
  };

  return (
    <Flex>
      <StyledButton
        type="primary"
        onClick={applySelected}
        loading={isLoading}
        disabled={!confirmedPredictions?.length}
      >
        {t('apply-selected-matches', {
          count: confirmedPredictions?.length || 0,
        })}
      </StyledButton>
    </Flex>
  );
};

const StyledButton = styled(Button)`
  white-space: nowrap;
  padding: 10px 10px;
`;

export default ApplySelectedMatchesButton;
