import React from 'react';
import { useTranslation } from 'react-i18next';

import get from 'lodash/get';
import isNaN from 'lodash/isNaN';
import last from 'lodash/last';

import { Button, Title } from '@cognite/cogs.js';

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
  value,
  onReset,
  onChange,
  onDelete,
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
          {get(value, metadataValue?.dataLabelIdentifier || '') ??
            metadataValue?.label}
        </Title>
        <ConfigForm
          metadataPath={metadataPath}
          metadataValue={metadataValue}
          value={value}
          valuePath={valuePath}
          onChange={onChange}
          onDelete={onDelete}
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
