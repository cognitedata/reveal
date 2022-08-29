import React from 'react';
import { TableToggleHideAllColumnProps } from 'react-table';
import { mergeRefs } from 'utils';

export const IndeterminateCheckbox = React.forwardRef<
  HTMLInputElement,
  TableToggleHideAllColumnProps
>(({ indeterminate, ...rest }, ref) => {
  const defaultRef = React.useRef<HTMLInputElement>();

  React.useEffect(() => {
    if (defaultRef && defaultRef.current) {
      defaultRef.current.indeterminate = Boolean(indeterminate);
    }
  }, [defaultRef, indeterminate]);
  // TODO: Replace with cogs.js checkbox when bug is fixed
  return <input type="checkbox" ref={mergeRefs([defaultRef, ref])} {...rest} />;
});
