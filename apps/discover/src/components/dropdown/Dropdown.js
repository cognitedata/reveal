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

import { Icons } from '@cognite/cogs.js';

import withStyles from 'styles/withStyles';

const styles = () => ({
  formControl: {
    minWidth: 200,
  },
  menuItem: {
    height: 40,
    color: '#000 !important',
    fontSize: 14,
    lineHeight: '24px',
    margin: 8,
    borderRadius: 4,
    paddingTop: 8,
    paddingBottom: 8,
    '&:focus': {
      backgroundColor: '#fff',
    },
  },
  dropDownArrowStyle: {
    top: 'calc(50% - 12px)',
    right: 0,
    position: 'absolute',
    pointerEvents: 'none',
  },
});

const DropdownComponent = withStyles(styles)((props) => {
  const {
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
  } = props;
  const [anchorEl, setAnchorEl] = useState(null);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function handleSelectItem(event) {
    if (handleChange) {
      if (isArray(event.target.value)) {
        const selectedItems = event.target.value.map((v) => {
          return items.find((f) => f[valueField] === v);
        });
        handleChange(event, selectedItems);
      } else {
        const value =
          event.target.value || event.target.getAttribute('data-value');
        const item = items.find((f) => f[valueField] === value);
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
          multiple={multiple}
          elevation={1}
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{ style: { minWidth: 200, ...menuStyle } }}
        >
          {items.map((i) => {
            return (
              <MenuItem
                onClick={handleSelectItem}
                className={classes.menuItem}
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
          multiple={multiple}
          elevation={1}
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{ style: { minWidth: 200 } }}
        >
          {items.map((i) => {
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

  const defaultRenderer = (item) => {
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
        IconComponent={() => (
          <Icons.LargeDown className={classes.dropDownArrowStyle} />
        )}
        renderValue={renderValue || defaultRenderer}
      >
        {items.map((i) => {
          return (
            <MenuItem
              className={classes.menuItem}
              key={i[valueField]}
              value={i[valueField]}
            >
              {i[displayField]}
            </MenuItem>
          );
        })}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
});

export const Dropdown = (props) => <DropdownComponent {...props} />;

// Dropdown.propTypes = {
//   /**  The string that's represented as a label.*/
//   label: PropTypes.string,
//   /**  Helpertext is the small infotext underneath the default dropdown*/
//   helperText: PropTypes.string,
//   /**  Which field should be set as a displayvalue for the dropdown.*/
//   displayField: PropTypes.string.isRequired,
//   /**  Which field should be set as a valuefield for the dropdown.*/
//   valueField: PropTypes.string.isRequired,
//   /**  If component is present it renders as the trigger component for the dropdown instead of the default dropdown.  */
//   component: PropTypes.object,
//   /**  handleChange event*/
//   handleChange: PropTypes.func,
// };

// Dropdown.defaultProps = {};
