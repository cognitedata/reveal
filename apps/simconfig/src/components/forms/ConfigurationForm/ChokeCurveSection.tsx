import { Input } from '@cognite/cogs.js';
import { Field, useFormikContext, getIn } from 'formik';
import { InputArea, InputAreaTitle, InputRow } from 'components/forms/elements';
import { GenericInformationTable } from 'components/app/elements';

import { CalculationConfig } from './types';

interface ComponentProps {
  isEditing: boolean;
}

export function ChokeCurveSection({
  isEditing,
}: React.PropsWithoutRef<ComponentProps>) {
  const { values, errors } = useFormikContext<CalculationConfig>();

  if (!values.chokeCurve) {
    return null;
  }

  return (
    <InputArea>
      <InputAreaTitle level={3}>Choke Setting Curve</InputAreaTitle>
      <InputRow>
        <Field
          type="string"
          as={Input}
          title="Unit"
          name="chokeCurve.unit"
          disabled={!isEditing}
          error={getIn(errors, 'chokeCurve.unit')}
        />
      </InputRow>
      <InputRow>
        <GenericInformationTable>
          <tbody>
            <tr>
              <td className="label">Choke opening(%)</td>
              {values.chokeCurve.opening.map((value) => (
                <td key={value} className="value">
                  {value}
                </td>
              ))}
            </tr>
            <tr>
              <td className="label">Choke setting(inch)</td>
              {values.chokeCurve.setting.map((value) => (
                <td key={value} className="value">
                  {value}
                </td>
              ))}
            </tr>
          </tbody>
        </GenericInformationTable>
      </InputRow>
    </InputArea>
  );
}
