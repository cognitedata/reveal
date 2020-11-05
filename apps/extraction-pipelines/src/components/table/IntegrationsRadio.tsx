import React, { RefObject } from 'react';
import { TableToggleCommonProps } from 'react-table';
import { Integration } from '../../model/Integration';
import { useSelectedIntegration } from '../../hooks/useSelectedIntegration';

interface IntegrationsRadioProps extends TableToggleCommonProps {
  inputId: string;
  integration: Integration;
}
const IntegrationsRadio = React.forwardRef(
  (
    {
      indeterminate,
      integration,
      inputId,
      onChange,
      ...rest
    }: IntegrationsRadioProps,
    ref
  ) => {
    const { setIntegration } = useSelectedIntegration();
    const defaultRef = React.useRef<RefObject<HTMLInputElement> | null>(null);
    const resolvedRef = (ref || defaultRef) as RefObject<HTMLInputElement>;

    React.useEffect(() => {
      if (indeterminate && resolvedRef.current) {
        resolvedRef.current.indeterminate = indeterminate;
      }
    }, [resolvedRef, indeterminate]);

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        // Type definition TableToggleCommonProps onChange is incorrectly defined
        // @ts-ignore
        onChange(e);
      }
      setIntegration(integration);
    };
    return (
      <label className="cogs-radio" htmlFor={inputId}>
        <input
          type="radio"
          id={inputId}
          ref={resolvedRef}
          onChange={handleOnChange}
          {...rest}
          data-testid={inputId}
        />
        <div className="radio-ui" />
      </label>
    );
  }
);

export default IntegrationsRadio;
