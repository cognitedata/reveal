import React, { useState, useEffect } from 'react';
import isEmpty from 'lodash/isEmpty';
import { SingleCogniteCapability } from '@cognite/sdk';

import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import { Icon, Button } from '@cognite/cogs.js';
import { Form, Drawer, Divider } from 'antd';

import {
  getAclType,
  getActionsFromCapability,
  getScopeFromCapability,
  getCapabilityScopes,
} from './utils';

import ScopesSelector from './ScopesSelector';
import ActionsSelector from './ActionsSelector';
import CapabilityTypeSelector from './CapabilityTypeSelector';

import { useTranslation } from 'common/i18n';

interface SingleCapabilityEditorProps {
  visible: boolean;
  capability?: SingleCogniteCapability | null;
  onOk(capability: SingleCogniteCapability): void;
  onCancel(): void;
}

type ValidateStatus = 'success' | 'warning' | 'error' | 'validating' | '';

interface FormValue<T> {
  value: T;
  validateStatus: ValidateStatus;
  errorMessage: string;
}

const initialFormValue = <T extends {}>(value: T): FormValue<T> => ({
  value,
  validateStatus: '',
  errorMessage: '',
});

const validateCapabilityType = (
  value: string,
  validationErrMessage: string
): FormValue<string> => {
  let validateStatus: ValidateStatus = 'success';
  let errorMessage = '';
  if (!value) {
    validateStatus = 'error';
    errorMessage = validationErrMessage;
  }
  return { value, validateStatus, errorMessage };
};

const validateActions = (
  value: string[],
  validationErrMessage: string
): FormValue<string[]> => {
  let validateStatus: ValidateStatus = 'success';
  let errorMessage = '';
  if (value.length === 0) {
    validateStatus = 'error';
    errorMessage = validationErrMessage;
  }
  return {
    value,
    validateStatus,
    errorMessage,
  };
};

const validateScope = (value: any, capability: string): FormValue<object> => {
  // TODO CDFUX-1572 - figure out translation
  if (value.assetIdScope && value.assetIdScope.subtreeIds.length === 0) {
    return {
      value,
      validateStatus: 'error',
      errorMessage: 'Select at least one asset',
    };
  }
  if (value.assetRootIdScope && value.assetRootIdScope.rootIds.length === 0) {
    return {
      value,
      validateStatus: 'error',
      errorMessage: 'Select at least one root asset',
    };
  }
  if (
    value.idscope &&
    value.idscope.ids.length === 0 &&
    capability === 'timeSeriesAcl'
  ) {
    return {
      value,
      validateStatus: 'error',
      errorMessage: 'Select at least one time series',
    };
  }
  if (
    value.idscope &&
    value.idscope.ids.length === 0 &&
    capability === 'securityCategoriesAcl'
  ) {
    return {
      value,
      validateStatus: 'error',
      errorMessage: 'Select at least one security category',
    };
  }
  if (
    value.idScope &&
    value.idScope.ids.length === 0 &&
    capability === 'extractionPipelinesAcl'
  ) {
    return {
      value,
      validateStatus: 'error',
      errorMessage: 'Select at least one extraction pipeline',
    };
  }
  if (
    value.idScope &&
    value.idScope.ids.length === 0 &&
    capability === 'datasetsAcl'
  ) {
    return {
      value,
      validateStatus: 'error',
      errorMessage: 'Select at least one data set',
    };
  }
  if (value.datasetScope && value.datasetScope.ids.length === 0) {
    return {
      value,
      validateStatus: 'error',
      errorMessage: 'Select at least one data set',
    };
  }
  if (
    value.extractionPipelineScope &&
    value.extractionPipelineScope.ids.length === 0
  ) {
    return {
      value,
      validateStatus: 'error',
      errorMessage: 'Select at least one extraction pipeline',
    };
  }
  if (value.partition && value.partition.partitionIds.length === 0) {
    return {
      value,
      validateStatus: 'error',
      errorMessage: 'Select at least one partition',
    };
  }
  if (value.tableScope && isEmpty(value.tableScope)) {
    return {
      value,
      validateStatus: 'error',
      errorMessage: 'Select at least one table',
    };
  }
  return {
    value,
    validateStatus: 'success',
    errorMessage: '',
  };
};

/*
  This is just a draft of the component. To be implemented.
*/
const SingleCapabilityEditor = (props: SingleCapabilityEditorProps) => {
  const { visible, capability, onOk, onCancel } = props;
  const { t } = useTranslation();

  const data = capability ? Object.values(capability)[0] : {};

  const [capabilityType, setCapabilityType] = useState<FormValue<string>>(
    initialFormValue<string>('')
  );
  const [actions, setActions] = useState<FormValue<string[]>>(
    initialFormValue<string[]>(data.actions || [])
  );
  const [scope, setScope] = useState<FormValue<object>>(
    initialFormValue<object>(data.scope || { all: {} })
  );

  const handleCapabilityTypeChange = (value: string) => {
    const errMessage = t('single-capability-validate-capability');
    const validationResult = validateCapabilityType(value, errMessage);
    setCapabilityType(validationResult);
    clearActions();
    setDefaultScope(value);
  };

  const handleActionsChange = (value: CheckboxValueType[]) => {
    const values = value as string[];
    const errMessage = t('single-capability-validate-action');
    const validationResult = validateActions(values, errMessage);
    setActions(validationResult);
  };

  const handleScopeChange = (value: object) => {
    const validationResult = validateScope(value, capabilityType.value);
    setScope(validationResult);
  };

  useEffect(() => {
    if (capability) {
      handleCapabilityTypeChange(getAclType(capability));
      handleActionsChange(getActionsFromCapability(capability));
      handleScopeChange(getScopeFromCapability(capability));
    }
    // eslint-disable-next-line
  }, [capability]);

  const clearCapabilityType = () =>
    setCapabilityType(initialFormValue<string>(''));
  const clearActions = () => handleActionsChange([]);
  const clearScope = () => handleScopeChange({ all: {} });

  const setDefaultScope = (value: string | undefined) => {
    const scopes = getCapabilityScopes(value);
    let defaultScope;
    if (scopes.includes('datasetScope')) {
      defaultScope = { datasetScope: { ids: [] } };
    } else if (scopes.includes('idScope')) {
      defaultScope = { idScope: { ids: [] } };
    } else if (scopes.includes('tableScope')) {
      defaultScope = { tableScope: {} };
    } else {
      defaultScope = { all: {} };
    }
    handleScopeChange(defaultScope);
  };

  const clearStateAndExit = () => {
    clearCapabilityType();
    clearActions();
    clearScope();
    onCancel();
  };

  const addCapability = () => {
    const newCapability: SingleCogniteCapability = {
      [`${capabilityType.value}`]: {
        actions: actions.value,
        scope: scope.value,
      },
    } as SingleCogniteCapability;
    onOk(newCapability);
    clearStateAndExit();
  };

  const title = capability ? t('capability-edit') : t('capability-add');

  const disabledStyle = { opacity: 0.5 };

  const actionsDisabled = capabilityType.validateStatus !== 'success';

  const showDataSetsRecommendation = () => {
    const resourcesWithDataSets = [
      'timeSeriesAcl',
      'assetsAcl',
      'eventsAcl',
      'sequencesAcl',
      'filesAcl',
    ];
    if (resourcesWithDataSets.includes(capabilityType.value)) {
      return (
        <p>
          {t('single-capability-scope-desc')}{' '}
          <a
            href="https://docs.cognite.com/cdf/data_governance/concepts/datasets/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('text-learn-more')}{' '}
          </a>
          {t('single-capability-about-dataset')}
        </p>
      );
    }
    return <div />;
  };

  const scopeDisabled = capabilityType.validateStatus !== 'success';
  return (
    <Drawer
      width={720}
      title={title}
      visible={visible}
      onClose={() => clearStateAndExit()}
    >
      <Form layout="vertical">
        <div>
          <Form.Item
            required
            label={t('capability-type')}
            validateStatus={capabilityType.validateStatus}
            help={capabilityType.errorMessage}
          >
            <CapabilityTypeSelector
              value={capabilityType.value}
              onChange={handleCapabilityTypeChange}
            />
          </Form.Item>
        </div>
        <Divider />
        <div style={actionsDisabled ? disabledStyle : {}}>
          <Form.Item label={t('text-actions')} required>
            {actionsDisabled ? (
              <div>
                <Icon type="Info" />
                {t('single-capability-action-info')}
              </div>
            ) : (
              <ActionsSelector
                capabilityType={capabilityType.value}
                value={actions.value}
                onChange={handleActionsChange}
              />
            )}
          </Form.Item>
        </div>
        <Divider />
        <div style={actionsDisabled ? disabledStyle : {}}>
          {showDataSetsRecommendation()}
          <Form.Item label={t('text-scope')} required>
            {scopeDisabled ? (
              <div>
                <Icon type="Info" />
                {t('single-capability-scope-info')}
              </div>
            ) : (
              <ScopesSelector
                capabilityKey={capabilityType.value}
                value={scope.value}
                onChange={handleScopeChange}
              />
            )}
          </Form.Item>
        </div>
        <Button
          disabled={
            !capabilityType.value ||
            !actions.value ||
            actions.value.length === 0 ||
            !scope.value ||
            !!scope.errorMessage
          }
          onClick={() => addCapability()}
        >
          {t('text-save')}
        </Button>
      </Form>
    </Drawer>
  );
};

export default SingleCapabilityEditor;
