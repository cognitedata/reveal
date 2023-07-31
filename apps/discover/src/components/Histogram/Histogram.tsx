import { BaseButton } from 'components/Buttons/BaseButton';
import { FlexGrow, FlexRow } from 'styles/layout';

import { Count, HistogramHolder, HistogramBar } from './elements';

type Props = {
  options: {
    selected?: boolean;
    key: string;
    name: string;
    count: number;
    total: number;
  };
  toggleFilter: (key: string) => void;
};

export const Histogram: React.FC<Props> = ({ options, toggleFilter }) => {
  const { selected, key, name, count, total } = options;
  return (
    <HistogramHolder>
      <FlexRow>
        <BaseButton
          type="secondary"
          data-testid="histogram-btn"
          size="small"
          toggled={selected}
          onClick={() => {
            toggleFilter(key);
          }}
          text={name}
          disabled={count === 0}
        />
        <FlexGrow />
        <Count>{count}</Count>
      </FlexRow>
      <HistogramBar value={(count / (total || 1)) * 100} />
    </HistogramHolder>
  );
};

export default Histogram;
