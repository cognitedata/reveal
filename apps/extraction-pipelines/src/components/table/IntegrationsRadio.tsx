import React, { RefObject } from 'react';
import { TableToggleCommonProps } from 'react-table';

interface IntegrationsRadioProps extends TableToggleCommonProps {
  inputId: string;
}
const IntegrationsRadio = React.forwardRef(
  ({ indeterminate, inputId, ...rest }: IntegrationsRadioProps, ref) => {
    const defaultRef = React.useRef<RefObject<HTMLInputElement> | null>(null);
    const resolvedRef = (ref || defaultRef) as RefObject<HTMLInputElement>;

    React.useEffect(() => {
      if (indeterminate && resolvedRef.current) {
        resolvedRef.current.indeterminate = indeterminate;
      }
    }, [resolvedRef, indeterminate]);

    return (
      <label className="cogs-radio" htmlFor={inputId}>
        <input
          type="radio"
          id={inputId}
          ref={resolvedRef}
          {...rest}
          data-testid={inputId}
        />
        <div className="radio-ui" />
      </label>
    );
  }
);

export default IntegrationsRadio;
