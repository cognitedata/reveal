import { DataScopeDto } from '@data-quality/api/codegen';
import { RequiredWrapper } from '@data-quality/components';
import { useDataModel } from '@data-quality/hooks';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { useFormik } from 'formik';

import {
  Body,
  Divider,
  Flex,
  Heading,
  InputExp,
  Modal,
  OptionType,
  Select,
  Textarea,
} from '@cognite/cogs.js';

import { useShowUpsertSuccess } from '../hooks';

import {
  DataScopeFormValues,
  emptyFormValues,
  filtersExample,
  handleValidate,
} from './helpers';
import { useUpsertDataScope } from './hooks';

type UpsertDataScopeModalProps = {
  editedDataScope?: DataScopeDto;
  isVisible: boolean;
  onCancel: () => void;
};

export const UpsertDataScopeModal = ({
  editedDataScope,
  isVisible = false,
  onCancel,
}: UpsertDataScopeModalProps) => {
  const { t } = useTranslation('DataScopeModal');

  const { isLoading, upsertDataScope } = useUpsertDataScope();
  const { showUpsertSuccess } = useShowUpsertSuccess();

  const titleText = editedDataScope
    ? t('data_quality_update_data_scope', '')
    : t('data_quality_new_data_scope', '');
  const okText = editedDataScope
    ? t('data_quality_save_changes', '')
    : t('data_quality_create_data_scope', '');

  const triggerSubmit = (newValues: DataScopeFormValues) => {
    upsertDataScope({
      editedDataScope,
      values: newValues,
      onSuccess: () => {
        showUpsertSuccess({
          isUpdate: !!editedDataScope,
          onSuccess: onCancel,
          targetName: values.name,
          targetType: 'Data scope',
        });

        resetForm();
      },
    });
  };

  const { errors, handleSubmit, resetForm, setFieldValue, values } =
    useFormik<DataScopeFormValues>({
      initialValues: editedDataScope ?? emptyFormValues,
      onSubmit: triggerSubmit,
      validate: handleValidate,
      validateOnBlur: false,
      validateOnChange: false,
      enableReinitialize: true,
    });

  const dataTypeOptions = useDataModel().dataModel.views.map((type) => ({
    label: type.externalId,
    value: type.externalId,
  }));

  const selectedDataType = dataTypeOptions.find(
    (type) => type.value === values.dataType
  );

  return (
    <Modal
      onCancel={isLoading ? undefined : onCancel}
      onOk={handleSubmit}
      okText={okText}
      title={titleText}
      visible={isVisible}
      okDisabled={isLoading}
    >
      <Flex direction="column" gap={24}>
        {/* Data scope name */}
        <Flex direction="column" gap={16}>
          <Heading level={5}>
            {t('data_quality_general_information', '')}
          </Heading>
          <Flex direction="column" gap={16}>
            <InputExp
              clearable
              fullWidth
              label={{
                required: true,
                info: undefined,
                text: t('data_quality_name', ''),
              }}
              onChange={(e) => setFieldValue('name', e.target.value)}
              placeholder={t('data_quality_set_name_data_scope', '')}
              status={errors.name ? 'critical' : undefined}
              statusText={errors.name}
              value={values.name}
            />
          </Flex>
        </Flex>

        <Divider />

        {/* Data type, data scope filters */}
        <Flex direction="column" gap={16}>
          <Heading level={5}>{t('data_quality_data_scope_setup', '')}</Heading>
          <Flex direction="column" gap={16}>
            <Flex direction="column">
              <Body size="small" muted>
                {t('data_quality_data_scope_info1', '')}
              </Body>
              <Body size="small" muted>
                {t('data_quality_data_scope_info2', '')}
              </Body>
            </Flex>

            <RequiredWrapper
              errorMessage={errors.dataType}
              label={t('data_quality_data_type', '')}
              showErrorMessage={!!errors.dataType}
            >
              <Select
                inputId="dataType"
                disabled={!!editedDataScope}
                onChange={(e: OptionType<string>) =>
                  setFieldValue('dataType', e.value)
                }
                options={dataTypeOptions}
                value={selectedDataType}
              />
            </RequiredWrapper>
            <Textarea
              error={errors.filters}
              fullWidth
              label={t('data_quality_filters', '')}
              onChange={(e) => setFieldValue('filters', e.target.value)}
              onClear={() => setFieldValue('filters', '')}
              placeholder={t('data_quality_set_filters', ``, {
                filtersExample,
              })}
              required
              value={values.filters}
              style={{ height: 'min(20vh, 300px)' }}
            />
          </Flex>
        </Flex>
      </Flex>
    </Modal>
  );
};
