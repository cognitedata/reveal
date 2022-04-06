import React, { useState, useEffect, useCallback } from 'react';
import isEmpty from 'lodash/isEmpty';
import { SingleCogniteCapability } from '@cognite/sdk';

import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import { Icon, Button } from '@cognite/cogs.js';
import { Form, Drawer, Divider } from 'antd';

import {
  CapabilityNames,
  CapabilityScope,
  FormValue,
  ScopeNames,
  ValidateStatus,
} from 'types';
import {
  getAclType,
  getActionsFromCapability,
  getScopeFromCapability,
  getCapabilityScopes,
} from './utils';

import ScopesSelector from './ScopesSelector';
import ActionsSelector from './ActionsSelector';
import CapabilityTypeSelector from './CapabilityTypeSelector';

interface SingleCapabilityEditorProps {
  visible: boolean;
  capability?: SingleCogniteCapability | null;
  onOk(capability: SingleCogniteCapability): void;
  onCancel(): void;
}

const initialFormValue = <T extends {}>(value: T): FormValue<T> => ({
  value,
  validateStatus: '',
  errorMessage: '',
});

const validateCapabilityType = (value: string): FormValue<string> => {
  let validateStatus: ValidateStatus = 'success';
  let errorMessage = '';
  if (!value) {
    validateStatus = 'error';
    errorMessage = 'Select a capability type';
  }
  return { value, validateStatus, errorMessage };
};

const validateActions = (value: string[]): FormValue<string[]> => {
  let validateStatus: ValidateStatus = 'success';
  let errorMessage = '';
  if (value.length === 0) {
    validateStatus = 'error';
    errorMessage = 'Select at least one action';
  }
  return {
    value,
    validateStatus,
    errorMessage,
  };
};

const validateScope = (
  value: CapabilityScope,
  capability: string
): FormValue<CapabilityScope> => {
  if (
    value.scope === ScopeNames.AssetIdScope &&
    value.assetIdScope?.subtreeIds.length === 0
  ) {
    return {
      value,
      validateStatus: 'error',
      errorMessage: 'Select at least one asset',
    };
  }
  if (
    value.scope === ScopeNames.AssetRootIdScope &&
    value.assetRootIdScope?.rootIds.length === 0
  ) {
    return {
      value,
      validateStatus: 'error',
      errorMessage: 'Select at least one root asset',
    };
  }
  if (
    value.scope === ScopeNames.Idscope &&
    value.idscope?.ids.length === 0 &&
    capability === CapabilityNames.TimeSeries
  ) {
    return {
      value,
      validateStatus: 'error',
      errorMessage: 'Select at least one time series',
    };
  }
  if (
    value.scope === ScopeNames.Idscope &&
    value.idscope?.ids.length === 0 &&
    capability === CapabilityNames.SecurityCategories
  ) {
    return {
      value,
      validateStatus: 'error',
      errorMessage: 'Select at least one security category',
    };
  }
  if (
    value.scope === ScopeNames.IdScope &&
    value.idScope?.ids.length === 0 &&
    capability === CapabilityNames.TemplateInstances
  ) {
    return {
      value,
      validateStatus: 'error',
      errorMessage: 'Select at least one template',
    };
  }
  if (
    value.scope === ScopeNames.IdScope &&
    value.idScope?.ids.length === 0 &&
    capability === CapabilityNames.DataSets
  ) {
    return {
      value,
      validateStatus: 'error',
      errorMessage: 'Select at least one data set',
    };
  }
  if (
    value.scope === ScopeNames.IdScope &&
    value.idScope?.ids.length === 0 &&
    capability === CapabilityNames.ExtractionPipelines
  ) {
    return {
      value,
      validateStatus: 'error',
      errorMessage: 'Select at least one extraction pipeline',
    };
  }
  if (
    value.scope === ScopeNames.DatasetScope &&
    value.datasetScope?.ids.length === 0
  ) {
    return {
      value,
      validateStatus: 'error',
      errorMessage: 'Select at least one data set',
    };
  }
  if (
    value.scope === ScopeNames.ExtractionPipelineScope &&
    value.extractionPipelineScope?.ids.length === 0
  ) {
    return {
      value,
      validateStatus: 'error',
      errorMessage: 'Select at least one extraction pipeline',
    };
  }
  if (
    value.scope === ScopeNames.PartitionScope &&
    value.partition?.partitionIds.length === 0
  ) {
    return {
      value,
      validateStatus: 'error',
      errorMessage: 'Select at least one partition',
    };
  }
  if (
    value.scope === ScopeNames.TableScope &&
    value.tableScope &&
    isEmpty(value.tableScope)
  ) {
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

  const data = capability ? Object.values(capability)[0] : {};

  const [capabilityType, setCapabilityType] = useState<FormValue<string>>(
    initialFormValue<string>('')
  );
  const [actions, setActions] = useState<FormValue<string[]>>(
    initialFormValue<string[]>(data.actions || [])
  );
  const [scope, setScope] = useState<FormValue<CapabilityScope>>(
    initialFormValue<CapabilityScope>(data.scope || { all: {} })
  );

  const handleCapabilityTypeChange = (value: string) => {
    const validationResult = validateCapabilityType(value);
    setCapabilityType(validationResult);
    clearActions();
  };

  const handleActionsChange = (value: CheckboxValueType[]) => {
    const values = value as string[];
    const validationResult = validateActions(values);
    setActions(validationResult);
  };

  const handleScopeChange = useCallback(
    (value: CapabilityScope) => {
      const validationResult = validateScope(value, capabilityType.value);
      setScope(validationResult);
    },
    [capabilityType.value]
  );

  const setDefaultScope = useCallback(
    (value: string | undefined) => {
      const scopes = getCapabilityScopes(value);
      let defaultScope: CapabilityScope;
      if (scopes.includes(ScopeNames.DatasetScope)) {
        defaultScope = {
          scope: ScopeNames.DatasetScope,
          datasetScope: { ids: [] },
        };
      } else if (scopes.includes(ScopeNames.IdScope)) {
        defaultScope = { scope: ScopeNames.IdScope, idScope: { ids: [] } };
      } else if (scopes.includes(ScopeNames.TableScope)) {
        defaultScope = { scope: ScopeNames.TableScope, tableScope: {} };
      } else {
        defaultScope = { scope: ScopeNames.AllScopes, all: {} };
      }
      handleScopeChange(defaultScope);
    },
    [handleScopeChange]
  );

  useEffect(() => {
    if (capability) {
      handleCapabilityTypeChange(getAclType(capability));
      handleActionsChange(getActionsFromCapability(capability));
      handleScopeChange(getScopeFromCapability(capability));
    }
    // eslint-disable-next-line
  }, [capability]);

  useEffect(() => {
    if (capabilityType.value !== '') {
      setDefaultScope(capabilityType.value);
    }
  }, [capabilityType, setDefaultScope]);

  const clearCapabilityType = () =>
    setCapabilityType(initialFormValue<string>(''));
  const clearActions = () => handleActionsChange([]);
  const clearScope = () =>
    handleScopeChange({ scope: ScopeNames.AllScopes, all: {} });

  const clearStateAndExit = () => {
    clearCapabilityType();
    clearActions();
    clearScope();
    onCancel();
  };

  const addCapability = () => {
    const { scope: _scopeName, ...scopeValue } = scope.value;
    const newCapability: SingleCogniteCapability = {
      [`${capabilityType.value}`]: {
        actions: actions.value,
        scope: scopeValue,
      },
    } as SingleCogniteCapability;
    onOk(newCapability);
    clearStateAndExit();
  };

  const title = capability ? 'Edit capability' : 'Add capability';

  const disabledStyle = { opacity: 0.5 };

  const actionsDisabled = capabilityType.validateStatus !== 'success';

  const showDataSetsRecommendation = () => {
    const resourcesWithDataSets: string[] = [
      CapabilityNames.TimeSeries,
      CapabilityNames.Assets,
      CapabilityNames.Events,
      CapabilityNames.Sequences,
      CapabilityNames.Files,
    ];
    if (resourcesWithDataSets.includes(capabilityType.value)) {
      return (
        <p>
          The scope defines what data the capability actions apply to. We
          recommend that you use data sets.{' '}
          <a
            href="https://docs.cognite.com/cdf/data_governance/concepts/datasets/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more{' '}
          </a>
          about data sets.
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
            label="Capability type"
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
          <Form.Item label="Actions" required>
            {actionsDisabled ? (
              <div>
                <Icon type="Info" /> The possible actions vary according to the
                capability type. First select a capability type above.
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
          <Form.Item label="Scope" required>
            {scopeDisabled ? (
              <div>
                <Icon type="Info" /> The scope options vary according to the
                capability type. First select a capability type above.
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
            scope.errorMessage !== ''
          }
          onClick={() => addCapability()}
        >
          Save
        </Button>
      </Form>
    </Drawer>
  );
};

export default SingleCapabilityEditor;
