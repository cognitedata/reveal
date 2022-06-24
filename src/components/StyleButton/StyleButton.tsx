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

interface Props extends ButtonProps {
  styleType: IconType;
  styleColor: string;
  label: string;
}
export const StyleButton = ({
  styleType,
  styleColor,
  label,
  disabled,
  ...rest
}: Props) => {
  return (
    <Button
      disabled={disabled}
      {...rest}
      type="ghost"
      icon={styleType}
      style={{
        height: 28,
        width: 28,
        borderRadius: 6,
        fontSize: 12.25,
        padding: 7.87,
        backgroundColor: styleColor,
        color: 'white',
        opacity: disabled ? `0.4` : `1`,
      }}
      aria-label={label}
    />
  );
};
