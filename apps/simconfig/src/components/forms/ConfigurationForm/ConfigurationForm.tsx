import { Form, Formik } from 'formik';
import noop from 'lodash/noop';

import { DataSamplingSection } from './DataSamplingSection';
import { CalculationConfig } from './types';

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
          <DataSamplingSection />
        </Form>
      )}
    </Formik>
  );
}
