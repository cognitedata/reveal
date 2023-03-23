import { Button, Flex } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import QueryStatusIcon from 'components/QueryStatusIcon';
import { Prediction } from 'hooks/entity-matching-predictions';
import { AppliedRules, Rule } from 'hooks/entity-matching-rules';
import { AssetIdUpdate } from 'hooks/types';
import { useUpdateAssetIds } from 'hooks/update';
import styled from 'styled-components';
import { SourceType } from 'types/api';
import QuickMatchResultsTable from './QuickMatchResultsTable';

type Props = {
  predictions: Prediction[];
  sourceType: SourceType;
  rules?: Rule[];
  appliedRules?: AppliedRules[];
};
export default function EntityMatchingResult({
  predictions,
  sourceType,
}: Props) {
  const { mutate, isLoading, status } = useUpdateAssetIds(sourceType);

  const { t } = useTranslation();
  const applyAll = () => {
    const updates: AssetIdUpdate[] = predictions.map(({ source, match }) => ({
      id: source.id,
      update: {
        assetId: { set: match.target.id },
      },
    }));

    mutate(updates);
  };

  return (
    <StyledFlex direction="column">
      <Flex justifyContent="flex-end">
        <StyledButton
          type="primary"
          disabled={isLoading}
          onClick={() => applyAll()}
        >
          {t('qm-results-apply-all')} <QueryStatusIcon status={status} />
        </StyledButton>
      </Flex>
      <QuickMatchResultsTable predictions={predictions} />
    </StyledFlex>
  );
}

const StyledButton = styled(Button)`
  width: 150px;
  padding: 10px;
`;

const StyledFlex = styled(Flex)`
  padding: 20px;
`;
