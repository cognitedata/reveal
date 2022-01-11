/**
 * Style Button
 * Charts table rows function | timeseries style selector
 *
 * @extens Button from cogs.js
 *
 * @styleType Must be a icon name from cogs.js
 * @styleColor a valid web color string
 * @label String for wai-aria
 */

import { Button } from '@cognite/cogs.js';

export type StyleButtonProps = {
  styleType: string;
  styleColor: string;
  label: string;
};
export const StyleButton = ({
  styleType,
  styleColor,
  label,
}: StyleButtonProps) => {
  return (
    <Button
      type="ghost"
      icon={styleType}
      style={{ height: 20, backgroundColor: styleColor, color: 'white' }}
      aria-label={label}
    />
  );
};
