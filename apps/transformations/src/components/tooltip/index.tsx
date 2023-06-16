import { TOOLTIP_DELAY_IN_MS } from '@transformations/utils/constants';

import { Tooltip as CogsTooltip, TooltipProps } from '@cognite/cogs.js';

const Tooltip = (props: TooltipProps): JSX.Element => {
  return <CogsTooltip delay={[TOOLTIP_DELAY_IN_MS, 0]} {...props} />;
};

export default Tooltip;
