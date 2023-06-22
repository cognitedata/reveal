import { Button } from '@cognite/cogs.js';

import { LINE_DASH_ARRAY } from '../../constants';

type LineDashTooltipProps = {
  dash?: number[];
  onUpdateDash: (dash?: number[]) => void;
};

export const LineDashTooltip: React.FC<LineDashTooltipProps> = ({
  dash,
  onUpdateDash,
}) => {
  return (
    <>
      <Button
        key="full-line"
        aria-label="full-line"
        type="ghost"
        icon="RemoveLarge"
        toggled={dash === undefined}
        onClick={() => onUpdateDash(undefined)}
      />
      <Button
        key="dashed-line"
        aria-label="dashed-line"
        type="ghost"
        icon="LineDashed"
        toggled={dash !== undefined}
        onClick={() => onUpdateDash(LINE_DASH_ARRAY)}
      />
    </>
  );
};
