/**
 * Style Button
 * Charts table rows function | timeseries style selector
 *
 * @extends Button from cogs.js
 *
 * @param styleType Must be a icon name from cogs.js
 * @param styleColor a valid web color string
 * @param label String for wai-aria
 * @param {boolean} [disabled] Enable or disable the button
 */

import { Button, IconType, ButtonProps } from '@cognite/cogs.js';

export type StyleButtonProps = {
  styleType: IconType;
  styleColor: string;
  label: string;
} & ButtonProps;
export const StyleButton = ({
  styleType,
  styleColor,
  label,
  disabled,
  ...rest
}: StyleButtonProps) => {
  return (
    <Button
      disabled={disabled}
      {...rest}
      type="ghost"
      icon={styleType}
      style={{
        height: 20,
        backgroundColor: styleColor,
        color: 'white',
        opacity: disabled ? `0.4` : `1`,
      }}
      aria-label={label}
    />
  );
};
