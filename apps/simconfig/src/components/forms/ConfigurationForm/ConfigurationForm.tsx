import { useContext, useRef, useState } from 'react';
import * as yup from 'yup';
import { Form, Formik, FormikProps } from 'formik';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectSelectedCalculation } from 'store/file/selectors';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { FormButton } from 'components/forms/elements';
import { updateCalculationFile } from 'store/file/thunks';
import { initialConfigFile } from 'store/file/constants';
import {
  getIntervalUnitValue,
  getIntervalValueInMinutes,
} from 'components/forms/utils';

import { DataSamplingSection } from './DataSamplingSection';
import { CalculationConfig } from './types';
import { InputSection } from './InputSection';
import { OutputSection } from './OutputSection';
import { ScheduleSection } from './ScheduleSection';

interface ComponentProps {
  formData?: CalculationConfig;
  externalId: string;
}

export function ConfigurationForm({
  formData,
  externalId,
}: React.PropsWithoutRef<ComponentProps>) {
  const dispatch = useAppDispatch();
  const { cdfClient } = useContext(CdfClientContext);
  const [isEditing, setIsEditing] = useState(false);
  const selectedFileInfo = useAppSelector(selectSelectedCalculation);
  const formikRef = useRef<FormikProps<CalculationConfig>>(null);

  const handleSubmit = async (values: CalculationConfig) => {
    if (!selectedFileInfo) {
      return;
    }
    const file = {
      fileInfo: {
        name: selectedFileInfo.name,
        externalId,
      },
      fileContent: values,
    };
    await dispatch(updateCalculationFile({ client: cdfClient, file }));
  };

  const onEditClick = () => {
    setIsEditing(!isEditing);
  };

  const validationSchema = yup.object().shape({
    schedule: yup.object().shape({
      repeat: yup
        .string()
        .test(
          'validate-is-less-than-vw',
          'Cannot be more frequent than validation window',
          (input) => {
            if (!input) {
              return false;
            }

            const validationWindow =
              formikRef.current?.values.dataSampling.validationWindow;

            if (!validationWindow) {
              return false;
            }

            const unit = getIntervalUnitValue(input);
            const value = parseInt(input, 10);
            const minutes = getIntervalValueInMinutes(value, unit);

            return minutes >= validationWindow;
          }
        ),
    }),
    dataSampling: yup.object().shape({
      validationWindow: yup.number().min(0),
      samplingWindow: yup
        .number()
        .lessThan(
          yup.ref('validationWindow'),
          'Must be less than Validation window'
        )
        .min(0),
    }),
    logicalCheck: yup.object().shape({
      value: yup.number(),
    }),
    steadyStateDetection: yup.object().shape({
      minSectionSize: yup.number().moreThan(0),
      varThreshold: yup.number().min(0),
      slopeThreshold: yup.number().lessThan(0),
    }),
  });

  return (
    <Formik
      enableReinitialize
      initialValues={formData || initialConfigFile}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      innerRef={formikRef}
    >
      {({ isValid, resetForm }) => (
        <Form>
          <FormButton
            aria-label="Cancel"
            type="secondary"
            icon="Close"
            disabled={!isEditing}
            htmlType="button"
            onClick={() => {
              resetForm({ values: formData || initialConfigFile });
              setIsEditing(false);
            }}
          >
            Cancel
          </FormButton>

          <FormButton
            aria-label={isEditing ? 'Save' : 'Edit'}
            type="primary"
            toggled={!isEditing}
            icon={isEditing ? 'Save' : 'Edit'}
            htmlType={isEditing ? 'button' : 'submit'}
            onClick={onEditClick}
            disabled={isEditing && !isValid}
          >
            {isEditing ? 'Save changes' : 'Edit Configuration'}
          </FormButton>
          <ScheduleSection isEditing={isEditing} />
          <DataSamplingSection isEditing={isEditing} />
          <InputSection />
          <OutputSection />
        </Form>
      )}
    </Formik>
  );
}
