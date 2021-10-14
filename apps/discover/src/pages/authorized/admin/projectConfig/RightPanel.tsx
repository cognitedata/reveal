import React from 'react';
import { useTranslation } from 'react-i18next';

import get from 'lodash/get';
import map from 'lodash/map';

import { Button, Title } from '@cognite/cogs.js';

import { Layers } from './configComponents/Layers';
import { ConfigInputField } from './ConfigInputField';
import {
  ProjectConfigFooter,
  RightPanelContainer,
  FormContainer,
} from './elements';
import { MetadataValue, HandleMetadataChange, Config } from './types';

interface Props {
  metadataConfig?: MetadataValue;
  onChange: HandleMetadataChange;
  onUpdate: () => void;
  onReset: () => void;
  hasChanges: boolean;
  valuePath: string;
  value?: Config[keyof Config];
}

const ConfigComponent: React.FC = () => {
  return <Layers />;
};

const FormFields: React.FC<Omit<Props, 'hasChanges' | 'onUpdate'>> = ({
  metadataConfig,
  value,
  valuePath,
  onChange,
  onReset,
}) => {
  return (
    <>
      {metadataConfig?.dataAsChildren && <ConfigComponent />}
      {map(metadataConfig?.children, (child, childKey) => {
        if (child.children) {
          return null;
        }
        return (
          <ConfigInputField
            key={`${valuePath}${childKey}`}
            value={get(value, childKey)}
            field={child}
            fieldKey={childKey}
            prefix={valuePath}
            onChange={onChange}
            onReset={onReset}
          />
        );
      })}
    </>
  );
};

export const RightPanel = ({
  metadataConfig,
  valuePath,
  value,
  onReset,
  onChange,
  onUpdate,
  hasChanges,
}: Props) => {
  const { t } = useTranslation();
  return (
    <RightPanelContainer direction="column" justifyContent="space-between">
      <FormContainer direction="column" gap={24}>
        <Title level={1}>{metadataConfig?.label}</Title>
        <FormFields
          metadataConfig={metadataConfig}
          value={value}
          valuePath={valuePath}
          onReset={onReset}
          onChange={onChange}
        />
      </FormContainer>
      <ProjectConfigFooter>
        <Button type="primary" onClick={onUpdate} disabled={!hasChanges}>
          {t('Save')}
        </Button>
      </ProjectConfigFooter>
    </RightPanelContainer>
  );
};
