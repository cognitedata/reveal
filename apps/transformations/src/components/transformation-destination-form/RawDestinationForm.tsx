import { useMemo } from 'react';

import { useTranslation } from '@transformations/common';
import FormFieldAutoComplete from '@transformations/components/form-field-auto-complete';
import { useDatabases, useTables } from '@transformations/hooks';
import { collectPages } from '@transformations/utils';
import { FormikProps } from 'formik';

import { TransformationDestinationFormValues } from '.';

type RawDestinationFormProps = {
  formik: FormikProps<TransformationDestinationFormValues>;
};

const RawDestinationForm = ({
  formik,
}: RawDestinationFormProps): JSX.Element => {
  const { t } = useTranslation();

  const { errors, setFieldValue, values } = formik;

  const { data: dbData } = useDatabases();
  const { data: tableData } = useTables(
    { database: values.rawDatabase ?? '' },
    { enabled: !!values.rawDatabase }
  );

  const databases = useMemo(
    () => collectPages(dbData).sort((a, b) => a.name.localeCompare(b.name)),
    [dbData]
  );
  const tables = useMemo(
    () => collectPages(tableData).sort((a, b) => a.name.localeCompare(b.name)),
    [tableData]
  );

  return (
    <>
      <FormFieldAutoComplete<TransformationDestinationFormValues['rawDatabase']>
        allowClear
        error={errors.rawDatabase}
        isRequired
        onChange={(value) => setFieldValue('rawDatabase', value)}
        options={databases
          .filter((db) =>
            db.name
              .toLowerCase()
              .startsWith(values.rawDatabase?.toLowerCase() ?? '')
          )
          .map((db) => ({ label: db.name, value: db.name }))}
        placeholder={t('target-database-placeholder')}
        title={t('target-database')}
        value={values.rawDatabase}
      />
      <FormFieldAutoComplete<TransformationDestinationFormValues['rawTable']>
        allowClear
        error={errors.rawTable}
        isRequired
        onChange={(value) => setFieldValue('rawTable', value)}
        options={tables
          .filter((tb) =>
            tb.name
              .toLowerCase()
              .startsWith(values.rawTable?.toLowerCase() ?? '')
          )
          .map((tb) => ({ label: tb.name, value: tb.name }))}
        placeholder={t('target-table-placeholder')}
        title={t('target-table')}
        value={values.rawTable}
      />
    </>
  );
};

export default RawDestinationForm;
