import { Chip } from '@cognite/cogs.js';

import { getScoreColor } from '../../utils/getScoreColor';

export interface ContextualizationScoreChipProps
  extends Omit<
    React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >,
    'onChange'
  > {
  className?: string;
  errorMessage?: string;
  isLocked?: boolean;
  label?: string;
  placeholder?: string;
  tooltip?: string;
  validate?: (value: string) => boolean;
  value: string;
  headerName: string | undefined;
}

export const ContextualizationScoreChip = ({
  tooltip,
  value,
  ...rest
}: ContextualizationScoreChipProps) => {
  return (
    <div {...rest}>
      <Chip
        onClick={() => console.log('Chip clicked')}
        appearance="outlined"
        size="small"
        tooltipProps={{ content: <div>{tooltip}</div> }}
        hideTooltip={Boolean(tooltip)}
        label={value + '%'}
        type={getScoreColor(Number(value))}
      />
    </div>
  );
};
