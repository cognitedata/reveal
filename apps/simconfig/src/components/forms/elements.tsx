import { Field, useFormikContext } from 'formik';
import styled from 'styled-components/macro';

import { Input, TextInput } from '@cognite/cogs.js';

import { getNodeFromPath } from 'utils/formUtils';

import { SegmentedControl } from './controls/SegmentedControl';

export const FormHeader = styled.h3`
  display: flex;
  align-items: center;
  column-gap: 12px;
  &:not(:first-child) {
    margin-top: 24px;
  }
`;

export const FormContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  row-gap: 12px;
`;

export const NumberInput = styled(TextInput)`
  width: ${(props) => props.width ?? 100}px;
  .title:empty {
    display: none;
  }
  input[type='number'] {
    appearance: auto !important;
  }
  & + .arrows {
    display: none !important;
  }
  .cogs-input {
    padding-right: var(--cogs-input-side-padding);
  }
  .input-wrapper {
    display: flex;
    padding: 0;
  }
  &.label-icon {
    .input-icon {
      width: auto;
      margin: 0 24px 0 0;
    }
  }
`;

export const FormRow = styled.div`
  display: flex;
  align-items: baseline;
  column-gap: 12px;
  & > label:first-child {
    flex: 1 1 33%;
    max-width: 240px;
  }
  .cogs-select {
    min-width: 120px;
  }
`;

export const FormRowStacked = styled.div`
  display: flex;
  align-items: baseline;
  column-gap: 12px;
  .cogs-select {
    min-width: 220px;
  }
`;

export function TextField({
  name,
  ...props
}: React.InputHTMLAttributes<unknown>) {
  const { values, setFieldValue } = useFormikContext<Record<string, unknown>>();

  if (!name) {
    return null;
  }

  const value = getNodeFromPath(values, name);

  return (
    <Field
      as={Input}
      name={name}
      setValue={(newValue: typeof value) => {
        setFieldValue(name, newValue);
      }}
      type="text"
      value={value}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setFieldValue(name, event.currentTarget.value);
      }}
      {...props}
    />
  );
}

export const StyledInput = styled(Input)((props) => ({
  width: props.width,
}));

export function NumberField({
  name,
  label,
  title,
  setValue,
  ...props
}: React.InputHTMLAttributes<unknown> & {
  label?: (value: number) => JSX.Element | string;
  setValue?: (value: string) => void;
  error?: string;
}) {
  const { errors, values, setFieldValue } =
    useFormikContext<Record<string, unknown>>();
  if (!name) {
    return null;
  }

  const value = getNodeFromPath(values, name);
  const errorText = getNodeFromPath(errors, name);

  const labelProps:
    | (React.HTMLAttributes<unknown> & {
        icon?: JSX.Element;
        iconPlacement?: string;
      })
    | undefined =
    label && typeof value === 'number'
      ? {
          className: `${props.className ?? ''} label-icon`,
          icon: <>{label(value)}</>,
          iconPlacement: 'right',
        }
      : undefined;

  return (
    <Field
      as={NumberInput}
      error={errorText}
      name={name}
      step={props.step ?? 'any'}
      // XXX Cogs.js hack to ensure input is wrapped in container element
      // eslint-disable-next-line react/jsx-no-useless-fragment
      title={title ?? <></>}
      type="number"
      value={value}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.currentTarget;
        if (setValue) {
          setValue(value);
        } else {
          setFieldValue(name, value);
        }
      }}
      {...labelProps}
      {...props}
    />
  );
}

export function TimeSeriesField({
  externalIdField,
  aggregateTypeField,
  externalIdDisabled,
  aggregateTypeDisabled,
}: {
  externalIdField: string;
  aggregateTypeField: string;
  externalIdDisabled?: boolean;
  aggregateTypeDisabled?: boolean;
}) {
  const { errors, values, setFieldValue } =
    useFormikContext<Record<string, unknown>>();

  const externalIdValue = getNodeFromPath(values, externalIdField);
  const aggregateTypeValue = getNodeFromPath(values, aggregateTypeField);
  const externalIdErrorText = getNodeFromPath(errors, externalIdField);
  const aggregateTypeErrorText = getNodeFromPath(errors, aggregateTypeField);

  if (
    typeof externalIdValue !== 'string' ||
    typeof aggregateTypeValue !== 'string'
  ) {
    return null;
  }

  return (
    <>
      <Field
        as={StyledInput}
        disabled={externalIdDisabled}
        error={externalIdErrorText}
        name={externalIdField}
        setValue={(value: string) => {
          setFieldValue(externalIdField, value);
        }}
        title="Time series"
        type="text"
        value={externalIdValue}
        width={400}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setFieldValue(externalIdField, event.currentTarget.value);
        }}
      />

      <div className="cogs-input-container">
        <div className="title">Sampling method</div>
        <SegmentedControl
          currentKey={aggregateTypeValue}
          disabled={aggregateTypeDisabled}
          error={aggregateTypeErrorText as string}
          fullWidth
          onButtonClicked={(value: string) => {
            setFieldValue(aggregateTypeField, value);
          }}
        >
          <SegmentedControl.Button key="average">
            Average
          </SegmentedControl.Button>
          <SegmentedControl.Button key="stepInterpolation">
            Step
          </SegmentedControl.Button>
          <SegmentedControl.Button key="interpolation">
            Interpolated
          </SegmentedControl.Button>
        </SegmentedControl>
      </div>
    </>
  );
}
