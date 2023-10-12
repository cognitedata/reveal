import styled from 'styled-components';

import { Field, useFormikContext } from 'formik';

import { SegmentedControl } from '@cognite/cogs.js';

import TimeseriesSelector from '../../../../../components/forms/controls/TimeSeriesSelector/TimeSeriesSelector';
import { TimeseriesOption } from '../../../../../components/forms/controls/TimeSeriesSelector/types';
import { getNodeFromPath } from '../../../../../utils/formUtils';

export function TimeSeriesField({
  externalIdField,
  aggregateTypeField,
  externalIdDisabled,
  aggregateTypeDisabled,
  window = 1440,
  endOffset = 0,
  width = 400,
}: {
  externalIdField: string;
  aggregateTypeField: string;
  externalIdDisabled?: boolean;
  aggregateTypeDisabled?: boolean;
  window?: number;
  endOffset?: number;
  width?: number;
}) {
  const { errors, values, setFieldValue } =
    useFormikContext<Record<string, unknown>>();

  const externalIdValue = getNodeFromPath(values, externalIdField);
  const aggregateTypeValue = getNodeFromPath(values, aggregateTypeField);
  const externalIdErrorText = getNodeFromPath(errors, externalIdField);

  if (
    typeof externalIdValue !== 'string' ||
    typeof aggregateTypeValue !== 'string'
  ) {
    return null;
  }

  return (
    <>
      <Field
        as={TimeseriesSelector}
        disabled={externalIdDisabled}
        endOffset={endOffset}
        error={externalIdErrorText}
        name={externalIdField}
        setValue={(value: string) => {
          setFieldValue(externalIdField, value);
        }}
        title="Time series"
        type="text"
        value={externalIdValue}
        width={width}
        window={window}
        onChange={(option: TimeseriesOption) => {
          setFieldValue(externalIdField, option.value);
        }}
      />

      <SamplingMethodComponent className="cogs-input-container">
        <div className="cogs cogs-textlabel">Sampling method</div>
        <SegmentedControl
          currentKey={aggregateTypeValue}
          disabled={aggregateTypeDisabled}
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
      </SamplingMethodComponent>
    </>
  );
}

const SamplingMethodComponent = styled.div`
  .title {
    text-transform: none;
  }
`;
