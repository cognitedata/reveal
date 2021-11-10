import { useContext, useState } from 'react';
import { Form, Formik } from 'formik';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectSelectedCalculation } from 'store/file/selectors';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { updateCalculationFile } from 'store/file/thunks';

import { DataSamplingSection } from './DataSamplingSection';
import { CalculationConfig } from './types';
import { InputSection } from './InputSection';
import { OutputSection } from './OutputSection';
import { ScheduleSection } from './ScheduleSection';

interface ComponentProps {
  formData: CalculationConfig;
}

export function ConfigurationForm({
  formData,
}: React.PropsWithoutRef<ComponentProps>) {
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useAppDispatch();
  const { cdfClient } = useContext(CdfClientContext);
  const selectedFileInfo = useAppSelector(selectSelectedCalculation);

  const handleSubmit = async (values: CalculationConfig) => {
    if (!selectedFileInfo) {
      return;
    }
    const file = {
      fileInfo: {
        name: selectedFileInfo.name,
        externalId: selectedFileInfo.externalId,
        mimeType: selectedFileInfo.mimeType,
      },
      fileContent: values,
    };
    await dispatch(updateCalculationFile({ client: cdfClient, file }));
  };

  const onEditClick = () => {
    setIsEditing(!isEditing);
  };
  return (
    <Formik initialValues={formData} onSubmit={handleSubmit}>
      {() => (
        <Form>
          <ScheduleSection isEditing={isEditing} onEditClick={onEditClick} />
          <DataSamplingSection />
          <InputSection />
          <OutputSection />
        </Form>
      )}
    </Formik>
  );
}
