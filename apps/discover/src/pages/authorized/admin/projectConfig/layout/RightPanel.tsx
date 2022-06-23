import React from 'react';

import get from 'lodash/get';
import isNaN from 'lodash/isNaN';
import last from 'lodash/last';

import { Button, Title } from '@cognite/cogs.js';

import { useTranslation } from 'hooks/useTranslation';

import { ConfigForm } from '../components/ConfigForm';
import { RightPanelProps } from '../types';

import {
  ProjectConfigFooter,
  RightPanelContainer,
  FormContainer,
} from './elements';

export const RightPanel = ({
  metadataPath,
  metadataValue,
  valuePath,
  values,
  onReset,
  onChange,
  onChangeAndUpdate,
  onUpdate,
  hasChanges,
  renderCustomComponent,
  renderDeleteComponent,
}: RightPanelProps) => {
  const { t } = useTranslation();

  const hasDataAsChildren =
    metadataValue?.dataAsChildren && isNaN(Number(last(valuePath.split('.'))));

  return (
    <RightPanelContainer direction="column" justifyContent="space-between">
      <FormContainer direction="column" gap={24}>
        <Title level={2}>
          {get(values, metadataValue?.dataLabelIdentifier || '') ??
            metadataValue?.label}
        </Title>
        <ConfigForm
          metadataPath={metadataPath}
          metadataValue={metadataValue}
          values={values}
          valuePath={valuePath}
          onChange={onChange}
          onChangeAndUpdate={onChangeAndUpdate}
          onUpdate={onUpdate}
          hasDataAsChildren={hasDataAsChildren}
          renderCustomComponent={renderCustomComponent}
          renderDeleteComponent={renderDeleteComponent}
          hasChanges={hasChanges}
        />
      </FormContainer>
      <ProjectConfigFooter gap={4} data-testid="project-config-footer">
        <Button type="secondary" onClick={onReset} disabled={!hasChanges}>
          {t('Reset')}
        </Button>
        <Button type="primary" onClick={onUpdate} disabled={!hasChanges}>
          {t('Save')}
        </Button>
      </ProjectConfigFooter>
    </RightPanelContainer>
  );
};
