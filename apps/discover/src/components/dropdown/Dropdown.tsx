/**
 * DO NOT USE THIS COMPONENT
 * -------------------------
 * Use cogs components in stead.
 *
 * Phasing out this one...
 */
import { isArray } from 'util';

import { useState } from 'react';

import {
  FormControl,
  FormHelperText,
  InputLabel,
  Menu,
  MenuItem,
  Select,
} from '@material-ui/core';
import { TS_FIX_ME } from 'core';

import { Icons } from '@cognite/cogs.js';

interface DropdownProps {
  /** ## DO NOT USE THIS COMPONENT */
  classes?: TS_FIX_ME;
  /** ## DO NOT USE THIS COMPONENT */
  label?: string;
  /** ## DO NOT USE THIS COMPONENT */
  selected?: TS_FIX_ME;
  /** ## DO NOT USE THIS COMPONENT */
  items?: TS_FIX_ME;
  /** ## DO NOT USE THIS COMPONENT */
  displayField: string;
  /** ## DO NOT USE THIS COMPONENT */
  valueField: string;
  /** ## DO NOT USE THIS COMPONENT */
  handleChange?: TS_FIX_ME;
  /** ## DO NOT USE THIS COMPONENT */
  helperText?: string;
  /** ## DO NOT USE THIS COMPONENT */
  style?: Record<string, unknown>;
  /** ## DO NOT USE THIS COMPONENT */
  component?: TS_FIX_ME;
  /** ## DO NOT USE THIS COMPONENT */
  children?: TS_FIX_ME;
  /** ## DO NOT USE THIS COMPONENT */
  className?: string;
  /** ## DO NOT USE THIS COMPONENT */
  multiple?: boolean;
  /** ## DO NOT USE THIS COMPONENT */
  renderValue?: TS_FIX_ME;
  /** ## DO NOT USE THIS COMPONENT */
  menuStyle?: Record<string, unknown>;
}

const renderIcon = () => <Icons.ChevronDownLarge />;

/**
 * DO NOT USE THIS COMPONENT
 * -------------------------
 * @deprecated Use cogs components in stead.
 */

export const Dropdown: React.FC<DropdownProps> = ({
  classes,
  label,
  selected,
  items,
  displayField,
  valueField,
  handleChange,
  helperText,
  style = {},
  component,
  children,
  className,
  multiple,
  renderValue,
  menuStyle = {},
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  function handleClick(event: TS_FIX_ME) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function handleSelectItem(event: TS_FIX_ME) {
    if (handleChange) {
      if (isArray(event.target.value)) {
        const selectedItems = event.target.value.map((v: TS_FIX_ME) => {
          return items.find((f: TS_FIX_ME) => f[valueField] === v);
        });
        handleChange(event, selectedItems);
      } else {
        const value =
          event.target.value || event.target.getAttribute('data-value');
        const item = items.find((f: TS_FIX_ME) => f[valueField] === value);
        handleChange(event, item);
      }
    }
    if (!multiple) setAnchorEl(null);
  }

  if (children) {
    return (
      <>
        {{
          ...children,
          props: { ...children.props, onClick: handleClick },
        }}

        <Menu
          elevation={1}
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{ style: { minWidth: 200, ...menuStyle } }}
        >
          {items.map((i: TS_FIX_ME) => {
            return (
              <MenuItem
                onClick={handleSelectItem}
                className={classes?.menuItem}
                key={i[valueField]}
                title={i[displayField]}
                data-value={i[valueField]}
                value={i[valueField]}
              >
                {i[displayField]}
              </MenuItem>
            );
          })}
        </Menu>
      </>
    );
  }

  if (component) {
    return (
      <>
        {{
          ...component,
          props: {
            ...component.props,
            onClick: handleClick,
            style: { ...style },
          },
        }}

        <Menu
          elevation={1}
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{ style: { minWidth: 200 } }}
        >
          {items.map((i: TS_FIX_ME) => {
            return (
              <MenuItem
                onClick={handleSelectItem}
                className={classes.menuItem}
                key={i[valueField]}
                data-value={i[valueField]}
                value={i[valueField]}
              >
                {i[displayField]}
              </MenuItem>
            );
          })}
        </Menu>
      </>
    );
  }

  const defaultRenderer = (item: TS_FIX_ME) => {
    return item && item[displayField];
  };

  return (
    <FormControl className={classes.formControl}>
      {label && <InputLabel>{label || ''}</InputLabel>}
      <Select
        multiple={multiple}
        value={selected}
        onChange={handleSelectItem}
        className={className}
        classes={classes.root}
        style={style}
        disableUnderline
        autoWidth
        IconComponent={renderIcon}
        renderValue={renderValue || defaultRenderer}
      >
        {items.map((i: TS_FIX_ME) => (
          <MenuItem
            className={classes.menuItem}
            key={i[valueField]}
            value={i[valueField]}
          >
            {i[displayField]}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};
