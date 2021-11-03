import { Form, Formik } from 'formik';
import noop from 'lodash/noop';

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
  return (
    <Formik initialValues={formData} onSubmit={() => noop()}>
      {() => (
        <Form>
          <ScheduleSection />
          <DataSamplingSection />
          <InputSection />
          <OutputSection />
        </Form>
      )}
    </Formik>
  );
}
