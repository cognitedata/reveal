import { Chip } from '@cognite/cogs.js';

type ConfidenceProps = {
  score?: number;
};

export default function Confidence(props: ConfidenceProps) {
  const { score } = props;
  const percentage =
    score && Number.isFinite(score)
      ? `${Math.round(score * 100).toFixed(1)}%`
      : null;
  if (percentage) {
    return <Chip label={percentage} size="x-small" />;
  }

  return <></>;
}
