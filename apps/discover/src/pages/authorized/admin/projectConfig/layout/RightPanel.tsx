import React, { Dispatch, SetStateAction, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import filter from 'lodash/filter';
import get from 'lodash/get';
import isNaN from 'lodash/isNaN';
import last from 'lodash/last';
import map from 'lodash/map';
import size from 'lodash/size';

import { Button, Title, Flex } from '@cognite/cogs.js';
import { ProjectConfig } from '@cognite/discover-api-types';

import { ConfigFormFields } from '../fields/ConfigFormFields';
import {
  MetadataValue,
  HandleConfigChange,
  HandleConfigUpdate,
  CustomComponent,
} from '../types';

import {
  ProjectConfigFooter,
  RightPanelContainer,
  FormContainer,
  ItemWrapper,
} from './elements';

interface Props {
  metadataValue?: MetadataValue;
  onChange: HandleConfigChange;
  onUpdate: HandleConfigUpdate;
  onReset: () => void;
  hasChanges: boolean;
  valuePath: string;
  metadataPath: string;
  value?: ProjectConfig[keyof ProjectConfig];
  renderCustomComponent: CustomComponent;
}

type ConfigFormProps = Omit<Props, 'hasChanges' | 'onUpdate'> & {
  hasDataAsChildren?: boolean;
};

const CreateNewComponent: React.FC<
  Omit<Props, 'onUpdate' | 'onReset' | 'hasChanges'> & {
    opened: boolean;
    setOpened: Dispatch<SetStateAction<boolean>>;
  }
> = ({
  opened,
  renderCustomComponent,
  setOpened,
  value,
  valuePath,
  metadataPath,
  onChange,
  metadataValue,
}) =>
  opened
    ? renderCustomComponent({
        onClose: () => setOpened(false),
        onOk: (datum: unknown) => {
          onChange(`${valuePath}.${size((value as []) || [])}`, datum);
          setOpened(false);
        },
        type: metadataPath,
        metadataValue,
      })
    : null;

const ConfigComponent: React.FC<{
  metadataValue?: Props['metadataValue'];
  value?: Props['value'];
  valuePath: Props['valuePath'];
  metadataPath: Props['metadataPath'];
  onChange: Props['onChange'];
  renderCustomComponent: Props['renderCustomComponent'];
}> = ({
  metadataValue,
  value,
  onChange,
  valuePath,
  metadataPath,
  renderCustomComponent,
}) => {
  const [createNewOpened, setCreateNewOpened] = React.useState(false);

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
        onClick={() => setCreateNewOpened(true)}
      >{`Create New ${metadataValue?.label}`}</Button>
      <CreateNewComponent
        opened={createNewOpened}
        setOpened={setCreateNewOpened}
        value={value}
        valuePath={valuePath}
        onChange={onChange}
        renderCustomComponent={renderCustomComponent}
        metadataValue={metadataValue}
        metadataPath={metadataPath}
      />
      {map(value as [], (datum, index) => {
        const label =
          get(datum, metadataValue?.dataLabelIdentifier || '') ??
          `${metadataValue?.label} ${index + 1}`;
        return (
          <Flex gap={8} alignItems="center" key={label}>
            <ItemWrapper level="4">{label}</ItemWrapper>
            <Button
              icon="Trash"
              aria-label="Delete item"
              onClick={() => handleChange(datum)}
              type="ghost"
            />
          </Flex>
        );
      })}
    </Flex>
  );
};

const ConfigForm: React.FC<ConfigFormProps> = ({
  metadataPath,
  metadataValue,
  value,
  valuePath,
  onChange,
  onReset,
  hasDataAsChildren,
  renderCustomComponent,
}) => {
  return (
    <>
      {hasDataAsChildren ? (
        <ConfigComponent
          renderCustomComponent={renderCustomComponent}
          metadataValue={metadataValue}
          value={value}
          onChange={onChange}
          valuePath={valuePath}
          metadataPath={metadataPath}
        />
      ) : (
        <ConfigFormFields
          metadataValue={metadataValue}
          value={value}
          valuePath={valuePath}
          onChange={onChange}
          onReset={onReset}
        />
      )}
    </>
  );
};

export const RightPanel = ({
  metadataPath,
  metadataValue,
  valuePath,
  value,
  onReset,
  onChange,
  onUpdate,
  hasChanges,
  renderCustomComponent,
}: Props) => {
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
          onReset={onReset}
          onChange={onChange}
          hasDataAsChildren={hasDataAsChildren}
          renderCustomComponent={renderCustomComponent}
        />
      </FormContainer>
      <ProjectConfigFooter gap={4}>
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
