import { Button, Flex } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import QueryStatusIcon from 'components/QueryStatusIcon';
import { Prediction } from 'hooks/contextualization-api';
import { useUpdateTimeseries } from 'hooks/timeseries';
import styled from 'styled-components';
import QuickMatchResultsTable from './QuickMatchResultsTable';

type Props = {
  predictions: Prediction[];
};
export default function EntityMatchingResult({ predictions }: Props) {
  const { mutate, isLoading, status } = useUpdateTimeseries();
  const { t } = useTranslation();
  const applyAll = () => {
    mutate(
      predictions.map(({ source, matches }) => ({
        id: source.id,
        update: {
          assetId: { set: matches[0].target.id },
        },
      }))
    );
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
