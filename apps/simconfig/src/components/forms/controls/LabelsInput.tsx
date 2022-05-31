import { useSelector } from 'react-redux';

import { Field } from 'formik';

import { Select } from '@cognite/cogs.js';
import { useGetLabelsListQuery } from '@cognite/simconfig-api-sdk/rtk';

import { selectProject } from 'store/simconfigApiProperties/selectors';

import { InputRow } from '../ModelForm/elements';
import { InputButton } from '../ModelForm/ModelForm';

interface LabelsInputProps {
  setFieldValue: (
    key: string,
    values: {
      label: string;
      value: string;
    }[]
  ) => void;
}

export function LabelsInput({ setFieldValue }: LabelsInputProps) {
  const project = useSelector(selectProject);
  const { data: labelsList } = useGetLabelsListQuery({ project });
  return (
    <InputRow>
      <InputButton>
        <Field
          as={Select}
          name="labels"
          options={
            labelsList?.labels
              ? labelsList.labels.map((label) => ({
                  value: label.externalId,
                  label: label.name,
                }))
              : []
          }
          title="Labels"
          isMulti
          required
          onChange={(values: { label: string; value: string }[]) => {
            setFieldValue('labels', values);
          }}
        />
      </InputButton>
    </InputRow>
  );
}
