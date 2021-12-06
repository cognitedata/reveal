import { Input, Switch, Select } from '@cognite/cogs.js';
import { Field, useFormikContext, getIn } from 'formik';
import { getSelectEntriesFromMap } from 'utils/formUtils';
import {
  InputArea,
  InputAreaTitle,
  InputRow,
  InputWithLabelContainer,
  InputLabel,
} from 'components/forms/elements';

import { BHP_ESTIMATION_METHOD, GAUGE_DEPTH_UNIT } from './constants';
import { CalculationConfig } from './types';

interface ComponentProps {
  isEditing: boolean;
}

export function BHPEstimationSection({
  isEditing,
}: React.PropsWithoutRef<ComponentProps>) {
  const { values, setFieldValue, errors } =
    useFormikContext<CalculationConfig>();

  const estimateBHPEnabled = values.estimateBHP?.enabled;

  if (!values.estimateBHP) {
    return null;
  }

  return (
    <InputArea>
      <InputAreaTitle level={3}>
        BHP Estimation
        <Switch
          disabled={!isEditing}
          value={values.estimateBHP.enabled}
          name="estimateBHP.enabled"
          onChange={(value: boolean) =>
            setFieldValue('estimateBHP.enabled', value)
          }
        />
      </InputAreaTitle>
      <InputRow>
        <InputWithLabelContainer>
          <InputLabel>Method</InputLabel>
          <Field
            as={Select}
            theme="grey"
            isDisabled={!isEditing || !estimateBHPEnabled}
            closeMenuOnSelect
            value={{
              value: values.estimateBHP.method,
              label: BHP_ESTIMATION_METHOD[values.estimateBHP.method],
            }}
            onChange={({ value }: { value: string }) => {
              setFieldValue('estimateBHP.method', value);
            }}
            options={getSelectEntriesFromMap(BHP_ESTIMATION_METHOD)}
            name="estimateBHP.method"
            fullWidth
            disabled={!isEditing || !estimateBHPEnabled}
          />
        </InputWithLabelContainer>
        {values.estimateBHP.gaugeDepth &&
          values.estimateBHP.method ===
            BHP_ESTIMATION_METHOD['BHP from gradient traverse'] && (
            <>
              <Field
                as={Input}
                title="Gauge Depth"
                type="number"
                name="estimateBHP.gaugeDepth.value"
                fullWidth
                error={getIn(errors, 'estimateBHP.gaugeDepth.value')}
                disabled
              />
              <InputWithLabelContainer>
                <InputLabel>Unit</InputLabel>
                <Field
                  as={Select}
                  theme="grey"
                  isDisabled={!isEditing || !estimateBHPEnabled}
                  closeMenuOnSelect
                  value={{
                    value: values.estimateBHP.gaugeDepth.unit,
                    label: GAUGE_DEPTH_UNIT[values.estimateBHP.gaugeDepth.unit],
                  }}
                  onChange={({ value }: { value: string }) => {
                    setFieldValue('estimateBHP.gaugeDepth.unit', value);
                  }}
                  options={getSelectEntriesFromMap(GAUGE_DEPTH_UNIT)}
                  name="estimateBHP.gaugeDepth.unit"
                  fullWidth
                  disabled={!isEditing || !estimateBHPEnabled}
                />
              </InputWithLabelContainer>
            </>
          )}
      </InputRow>
    </InputArea>
  );
}
