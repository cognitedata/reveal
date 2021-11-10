import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import filter from 'lodash/filter';
import get from 'lodash/get';
import isNaN from 'lodash/isNaN';
import last from 'lodash/last';
import map from 'lodash/map';

import { Button, Title, Flex } from '@cognite/cogs.js';
import { ProjectConfig } from '@cognite/discover-api-types';

import { ConfigInputField } from './ConfigInputField';
import {
  ProjectConfigFooter,
  RightPanelContainer,
  FormContainer,
  ItemWrapper,
} from './elements';
import { MetadataValue, HandleConfigChange, HandleConfigUpdate } from './types';

interface Props {
  metadataConfig?: MetadataValue;
  onChange: HandleConfigChange;
  onUpdate: HandleConfigUpdate;
  onReset: () => void;
  hasChanges: boolean;
  valuePath: string;
  value?: ProjectConfig[keyof ProjectConfig];
}

const ConfigComponent: React.FC<{
  metadataConfig?: Props['metadataConfig'];
  value?: Props['value'];
  valuePath: Props['valuePath'];
  onChange: Props['onChange'];
}> = ({ metadataConfig, value, onChange, valuePath }) => {
  const handleChange = useCallback(
    (datum) => {
      onChange(
        valuePath,
        filter(value as [], (_valueItem) => _valueItem !== datum)
      );
    },
    [onChange, valuePath, value]
  );
  return (
    <Flex direction="column" gap={16} alignItems="flex-start">
      <Button
        type="secondary"
        icon="PlusCompact"
        iconPlacement="right"
      >{`Create New ${metadataConfig?.label}`}</Button>
      {map(value as [], (datum) => {
        return (
          <Flex gap={8} alignItems="center">
            <ItemWrapper level="4">
              {get(datum, metadataConfig?.dataLabelIdentifier || '')}
            </ItemWrapper>
            <Button
              icon="Trash"
              onClick={() => handleChange(datum)}
              variant="ghost"
            />
          </Flex>
        );
      })}
    </Flex>
  );
};

const FormFields: React.FC<
  Omit<Props, 'hasChanges' | 'onUpdate'> & { hasDataAsChildren?: boolean }
> = ({
  metadataConfig,
  value,
  valuePath,
  onChange,
  onReset,
  hasDataAsChildren,
}) => {
  return (
    <>
      {hasDataAsChildren ? (
        <ConfigComponent
          metadataConfig={metadataConfig}
          value={value}
          onChange={onChange}
          valuePath={valuePath}
        />
      ) : (
        map(metadataConfig?.children, (child, childKey) => {
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
        })
      )}
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

  const hasDataAsChildren =
    metadataConfig?.dataAsChildren && isNaN(Number(last(valuePath.split('.'))));

  return (
    <RightPanelContainer direction="column" justifyContent="space-between">
      <FormContainer direction="column" gap={24}>
        <Title level={2}>
          {get(value, metadataConfig?.dataLabelIdentifier || '') ??
            metadataConfig?.label}
        </Title>
        <FormFields
          metadataConfig={metadataConfig}
          value={value}
          valuePath={valuePath}
          onReset={onReset}
          onChange={onChange}
          hasDataAsChildren={hasDataAsChildren}
        />
      </FormContainer>
      <ProjectConfigFooter>
        <Button
          type="primary"
          onClick={() => onUpdate()}
          disabled={!hasChanges}
        >
          {t('Save')}
        </Button>
      </ProjectConfigFooter>
    </RightPanelContainer>
  );
};
