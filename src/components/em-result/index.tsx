import { Button, Flex, Icon } from '@cognite/cogs.js';
import QueryStatusIcon from 'components/QueryStatusIcon';
import { Prediction } from 'hooks/contextualization-api';
import { useUpdateTimeseries } from 'hooks/timeseries';
import { formatPredictionObject } from 'utils';

type Props = {
  predictions: Prediction[];
};
export default function EntityMatchingResult({ predictions }: Props) {
  const { mutate, isLoading, status } = useUpdateTimeseries();
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
    <Flex direction="column">
      <Button type="primary" disabled={isLoading} onClick={() => applyAll()}>
        Apply all <QueryStatusIcon status={status} />
      </Button>
      {predictions.map(({ source, matches }) => (
        <Flex key={source.id} gap={12}>
          <div>{matches[0]?.score.toFixed(1)}s</div>
          <div>{formatPredictionObject(source)}</div>
          <Icon type="ArrowRight" />
          {matches.length > 0 && (
            <div>{formatPredictionObject(matches[0]?.target)}</div>
          )}
        </Flex>
      ))}
    </Flex>
  );
}
