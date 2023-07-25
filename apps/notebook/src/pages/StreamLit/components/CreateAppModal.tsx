import { useEffect, useMemo, useState } from 'react';

import {
  Modal,
  Input,
  Textarea,
  Divider,
  Body,
  Icon,
  Flex,
  toast,
  Select,
  OptionType,
} from '@cognite/cogs.js';
import { DataSet } from '@cognite/sdk';

import { useApps } from '../../../hooks/useApps';
import { useDataSets } from '../../../hooks/useDataSets';
import { getContainer } from '../../../utils';
import { defaultApps } from '../defaultApps';

import { Selector } from './Selector';

type Props = {
  onCancel: () => void;
  onCreate: (
    appName: string,
    appExternalId: string,
    appDescription: string,
    template?: string,
    dataSet?: DataSet
  ) => void;
};

export const CreateAppModal = ({ onCreate, onCancel }: Props) => {
  const [appName, setAppName] = useState<string>('');
  const [template, setTemplate] = useState<string>('');
  const [appDescription, setAppDescription] = useState<string>('');
  const [selectedDataSet, setSelectedDataSet] = useState<DataSet>();

  const { data: existindApps } = useApps();

  const existingAppExternalIds = useMemo(
    () => existindApps?.map((el) => el.fileExternalId) || [],
    [existindApps]
  );

  const appExternalId = 'stapp-' + appName.replace(' ', '-').toLowerCase();
  const appNameExists = existingAppExternalIds.includes(appExternalId);

  const { data: dataSets = [], error } = useDataSets();

  useEffect(() => {
    if (error) {
      toast.error('Unable to fetch data sets');
    }
  }, [error]);

  return (
    <Modal
      onOk={() => {
        if (!appName) {
          return;
        }
        onCreate(
          appName,
          appExternalId,
          appDescription,
          template ? template : undefined,
          selectedDataSet
        );
      }}
      okDisabled={appName.trim() === '' || appNameExists}
      onCancel={onCancel}
      visible
      title="Create app"
    >
      <Flex direction="column" gap={8}>
        <label>Name *</label>
        <Input
          fullWidth
          onChange={(e) => setAppName(e.target.value)}
          placeholder="Name of your app"
          style={{ marginBottom: 12 }}
        />
        {appNameExists && (
          <Body level={3} className="description" muted>
            An app with this name already exists
          </Body>
        )}
        <label>Description</label>
        <Textarea
          fullWidth
          onChange={(e) => setAppDescription(e.target.value)}
          placeholder="Describe what is the goal for your app"
          style={{ marginBottom: 12 }}
        />
        <label>Restrict access to the app</label>
        <Select
          style={{ width: '100%' }}
          allowClear
          menuPortalTarget={getContainer()}
          showSearch
          placeholder="Select a data set to govern access to this app"
          optionFilterProp="children"
          value={
            selectedDataSet
              ? {
                  label: `${
                    selectedDataSet.name ||
                    selectedDataSet.externalId ||
                    selectedDataSet.id
                  }`,
                  value: `${selectedDataSet.id}`,
                }
              : undefined
          }
          onChange={(selectedOption: OptionType<string> | null) => {
            if (selectedOption?.value) {
              const dataSet = dataSets?.find(
                (el) => `${el.id}` === selectedOption.value
              );
              setSelectedDataSet(dataSet);
            }
          }}
          options={dataSets?.map((el) => ({
            label: `${el.name || el.externalId || el.id}`,
            value: `${el.id}`,
          }))}
        />
        <Divider style={{ marginTop: 8, marginBottom: 8 }} />
        <Selector>
          <Selector.Item
            onClick={() => setTemplate('')}
            $isSelected={template === ''}
          >
            <Icon type="Edit" />
            <Flex direction="column" style={{ flex: 1 }}>
              <Body className="name" strong>
                Start from scratch
              </Body>
              <Body level={3} className="description" muted>
                Create your app from scratch using Python and Copilot.
              </Body>
            </Flex>
          </Selector.Item>
          {defaultApps.map((el) => (
            <Selector.Item
              key={el.name}
              onClick={() => setTemplate(el.name)}
              $isSelected={template === el.name}
            >
              <Icon type="DocumentCode" />
              <Flex direction="column" style={{ flex: 1 }}>
                <Body className="name" strong>
                  {el.name}
                </Body>
                <Body level={3} className="description" muted>
                  {el.description}
                </Body>
              </Flex>
            </Selector.Item>
          ))}
        </Selector>
      </Flex>
    </Modal>
  );
};
