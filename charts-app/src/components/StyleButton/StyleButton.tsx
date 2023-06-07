/**
 * Style Button
 * Charts table rows function | timeseries style selector
 *
 * @extends Button from cogs.js
 *
 * @param styleColor a valid web color string
 * @param label String for wai-aria
 * @param {boolean} [disabled] Enable or disable the button
 */

import { Button, ButtonProps } from '@cognite/cogs.js';

interface Props extends ButtonProps {
  styleColor: string;
  label: string;
}

export const StyleButton = ({
  styleColor,
  label,
  disabled,
  size,
  ...rest
}: Props) => {
  const base = size === 'small' ? 16 : 28;
  return (
    <Button
      disabled={disabled}
      {...rest}
      type="ghost"
      style={{
        height: base,
        width: base,
        borderRadius: base / 4,
        fontSize: 12.25,
        padding: 7.87,
        backgroundColor: styleColor,
        color: 'white',
        opacity: disabled ? `0.4` : `1`,
        ...rest.style,
      }}
      aria-label={label}
    />
  );
};
