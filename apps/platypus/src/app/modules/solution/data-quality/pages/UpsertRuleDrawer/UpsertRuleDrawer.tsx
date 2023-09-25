import { RuleDto, RuleSeverity } from '@data-quality/api/codegen';
import { useDataModel } from '@data-quality/hooks/useDataModel';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { useFormik } from 'formik';

import {
  Divider,
  Drawer,
  Flex,
  Heading,
  InputExp,
  OptionType,
  Select,
  Textarea,
} from '@cognite/cogs.js';

import { UpsertRuleFooter } from './components/UpsertRuleFooter';
import {
  RuleFormValues,
  RuleSeverityOptions,
  conditionsExample,
  emptyFormValues,
  handleValidate,
} from './helpers';
import { useShowUpsertSuccess, useUpsertRule } from './hooks';

type UpsertRuleDrawerProps = {
  editedRule?: RuleDto;
  isVisible: boolean;
  onCancel: () => void;
};

export const UpsertRuleDrawer = ({
  editedRule,
  isVisible = false,
  onCancel,
}: UpsertRuleDrawerProps) => {
  const { t } = useTranslation('UpsertRule');

  const { isLoading, upsertRule } = useUpsertRule();
  const { showUpsertSuccess } = useShowUpsertSuccess();

  const triggerSubmit = (newValues: RuleFormValues) => {
    upsertRule({
      editedRule,
      values: newValues,
      onSuccess: () => {
        showUpsertSuccess({
          isUpdate: !!editedRule,
          onSuccess: onCancel,
          ruleName: values.name,
        });

        resetForm();
      },
    });
  };

  const { errors, handleSubmit, resetForm, setFieldValue, values } =
    useFormik<RuleFormValues>({
      initialValues: editedRule ?? emptyFormValues,
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

  const titleText = editedRule
    ? t('data_quality_update_rule', 'Update rule')
    : t('data_quality_new_rule', 'New rule');
  const okText = editedRule
    ? t('data_quality_save_changes', 'Save changes')
    : t('data_quality_create_rule', 'Create rule');

  return (
    <Drawer
      onCancel={isLoading ? undefined : onCancel}
      title={titleText}
      visible={isVisible}
      width="40%"
      footer={
        <UpsertRuleFooter
          isLoading={isLoading}
          okText={okText}
          onCancel={onCancel}
          onOk={handleSubmit}
        />
      }
    >
      <Flex direction="column" gap={24}>
        {/* Rule name, error message, severity, description */}
        <Flex direction="column" gap={16}>
          <Heading level={5}>
            {t('data_quality_general_information', 'General information')}
          </Heading>
          <Flex direction="column" gap={16}>
            <InputExp
              clearable
              fullWidth
              label={{
                required: true,
                info: undefined,
                text: t('data_quality_name', 'Name'),
              }}
              onChange={(e) => setFieldValue('name', e.target.value)}
              placeholder={t('data_quality_set_name', 'Set a name to the rule')}
              status={errors.name ? 'critical' : undefined}
              statusText={errors.name}
              value={values.name}
            />
            <Flex
              alignItems="center"
              direction="row"
              gap={24}
              justifyContent="space-between"
            >
              <Flex direction="column" style={{ width: '100%' }}>
                <InputExp
                  clearable
                  fullWidth
                  label={{
                    required: false,
                    info: undefined,
                    text: t('data_quality_error_message', 'Error message'),
                  }}
                  onChange={(e) =>
                    setFieldValue('errorMessage', e.target.value)
                  }
                  placeholder={t(
                    'data_quality_set_error_msg',
                    'Add an error message to the rule'
                  )}
                  value={values.errorMessage}
                />
              </Flex>
              <Flex direction="column" style={{ width: '40%' }}>
                <Select
                  inputId="severity"
                  label={t('data_quality_severity', 'Severity')}
                  onChange={(e: OptionType<RuleSeverity>) =>
                    setFieldValue('severity', e.value)
                  }
                  options={RuleSeverityOptions}
                  value={{ label: values.severity, value: values.severity }}
                />
              </Flex>
            </Flex>
            <Textarea
              fullWidth
              label={t('data_quality_description', 'Description')}
              onChange={(e) => setFieldValue('description', e.target.value)}
              onClear={() => setFieldValue('description', '')}
              placeholder={t(
                'data_quality_set_description',
                'Add a description to the rule'
              )}
              value={values.description}
            />
          </Flex>
        </Flex>

        <Divider />

        {/* Data type, rule conditions */}
        <Flex direction="column" gap={16}>
          <Heading level={5}>
            {t('data_quality_rule_setup', 'Rule setup')}
          </Heading>
          <Flex direction="column" gap={16}>
            <Select
              inputId="dataType"
              disabled={!!editedRule}
              label={t('data_quality_data_type', 'Data type')}
              onChange={(e: OptionType<string>) =>
                setFieldValue('dataType', e.value)
              }
              options={dataTypeOptions}
              value={selectedDataType}
            />

            <Textarea
              error={errors.conditions}
              fullWidth
              label={t('data_quality_conditions', 'Conditions')}
              onChange={(e) => setFieldValue('conditions', e.target.value)}
              onClear={() => setFieldValue('conditions', '')}
              placeholder={t(
                'data_quality_set_conditions',
                `Enter your conditions as such: ${conditionsExample}`,
                { conditionsExample }
              )}
              required
              value={values.conditions}
              style={{ height: 'min(20vh, 300px)' }}
            />
          </Flex>
        </Flex>
      </Flex>
    </Drawer>
  );
};
