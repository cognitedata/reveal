import React, { useState, useMemo } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';

import { TS_FIX_ME } from 'core';
import get from 'lodash/get';

import ClickAwayListener from 'components/clickAwayListener';

import { SelectListItem, SelectListWrapper } from './elements';

interface Props<T> {
  // Items to be displayed within the list.
  items: T[];
  // The items that's tagged as selectged
  selectedItem?: T;
  // Callback to render the display value.
  renderDisplay: (item: T) => any;
  // onClick event
  onClick?: (item: T) => void;
  // onClose event
  onClose?: () => void;
  // onOpen event
  onOpen?: () => void;
  disableCloseOnClick?: boolean;

  keyField: string; // would be nice to do: keyof T, but we want to use 'get' for nested keys
  style?: any; // wrapping style - DEPRECATED - wrap before you use this.
}

// TODO(PP-2528): Delete this component and replace with the one from Cogs

export const Select = <T,>({
  renderDisplay,
  children,
  items,
  onClick,
  onClose,
  onOpen,
  selectedItem,
  disableCloseOnClick,
  style,
  keyField,
}: React.PropsWithChildren<Props<T>>) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClose = () => {
    if (onClose) onClose();
    setAnchorEl(null);
  };
  const handleClick = (event: TS_FIX_ME) => {
    if (anchorEl) setAnchorEl(null);
    else {
      if (onOpen) onOpen();
      setAnchorEl(event.currentTarget);
    }
  };

  const handleOnClick = (item: T) => () => {
    if (onClick) onClick(item);
    if (!disableCloseOnClick) handleClose();
  };
  const selectedDisplayValue = useMemo(() => {
    return selectedItem ? renderDisplay(selectedItem) : '';
  }, [selectedItem]);

  return (
    <div style={style}>
      {React.cloneElement(children as React.ReactElement, {
        onClick: handleClick,
      })}
      {Boolean(anchorEl) && (
        <ClickAwayListener onClickAway={handleClose}>
          <SelectListWrapper id="select-list" elevation={1}>
            <Scrollbars autoHeight autoHeightMax={400}>
              <ul>
                {items.map((item) => {
                  const view = renderDisplay(item);
                  const selected =
                    selectedDisplayValue.localeCompare(view) === 0;
                  return (
                    <SelectListItem
                      selected={selected}
                      key={`select-${get(item, keyField)}`}
                      onClick={handleOnClick(item)}
                    >
                      {view}
                    </SelectListItem>
                  );
                })}
              </ul>
            </Scrollbars>
          </SelectListWrapper>
        </ClickAwayListener>
      )}
    </div>
  );
};
