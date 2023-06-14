import { useEffect, useMemo, useState } from 'react';

import {
  Body,
  Button,
  Divider,
  Flex,
  Input,
  Modal,
  Select,
  toast,
} from '@cognite/cogs.js';

import { getContainer } from '../../../../GlobalStyles';
import { configs } from '../../../common/data';
import { useCreateModule } from '../../../hooks/useCreateModule';
import { useDataSets } from '../../../hooks/useDataSets';
import { useExtractorPipelines } from '../../../hooks/useExtractorPipelines';
import { useExtractors } from '../../../hooks/useExtractors';

export const CreateModuleModal = ({
  id,
  visible,
  onClose,
}: {
  id: string;
  visible: boolean;
  onClose: () => void;
}) => {
  const [selectedPipeline, setSelectedPipeline] = useState<string>('');
  const [selectedDataSet, setSelectedDataSet] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newKey, setNewKey] = useState<string>('');
  const [secrets, setSecrets] = useState<{
    [key in string]: string;
  }>({});

  const { data: dataSets = [] } = useDataSets();
  const { refetch: refetchPipelines } = useExtractorPipelines();

  const requiredKeys = useMemo(() => {
    return ['COGNITE_CLIENT_ID', 'COGNITE_CLIENT_SECRET'].concat(
      configs[selectedPipeline]?.requiredCredentials || []
    );
  }, [selectedPipeline]);

  useEffect(() => {
    if (!visible) {
      setSelectedPipeline('');
      setSelectedDataSet('');
      setNewName('');
      setNewKey('');
    }
  }, [visible]);

  useEffect(() => {
    setSecrets((currSecret) => ({
      COGNITE_CLIENT_ID: currSecret.COGNITE_CLIENT_ID || '',
      COGNITE_CLIENT_SECRET: currSecret.COGNITE_CLIENT_SECRET || '',
      ...(
        (selectedPipeline && configs[selectedPipeline]?.requiredCredentials) ||
        []
      ).reduce((acc, curr) => {
        acc[curr] = currSecret[curr] || '';
        return acc;
      }, {} as typeof currSecret),
      ...(selectedPipeline
        ? configs[selectedPipeline]?.defaultCredentials
        : {}),
    }));
  }, [selectedPipeline]);

  const { data: extractors = [] } = useExtractors();

  const { mutate: createModule } = useCreateModule(id);

  return (
    <Modal
      visible={visible}
      title="Create new module"
      onCancel={() => onClose()}
      okDisabled={
        Object.values(secrets).some((el) => !el || el.trim() === '') ||
        !newName ||
        !selectedDataSet ||
        !selectedPipeline
      }
      onOk={() => {
        setTimeout(async () => {
          await createModule({
            name: newName!,
            dataSetExternalId: selectedDataSet,
            extratorType: selectedPipeline,
            config: secrets,
          });
          setTimeout(async () => {
            await refetchPipelines();
          }, 1000);
          toast.open('Successfully added new module', {
            type: 'success',
          });
          onClose();
        }, 300);
      }}
    >
      <Flex direction="column" gap={8}>
        <Body level={5} strong>
          Name*
        </Body>
        <Input
          label="Name"
          headers="Name"
          value={newName}
          onChange={(ev) => setNewName(ev.target.value)}
        />
        <Body style={{ marginTop: 16 }} level={5} strong>
          Select type of extractor*
        </Body>
        <Select
          menuPortalTarget={getContainer()}
          value={
            selectedPipeline
              ? {
                  label: extractors.find(
                    (el) => el.externalId === selectedPipeline
                  )!.name,
                  value: selectedPipeline,
                }
              : undefined
          }
          onChange={(selected: { value: string }) =>
            setSelectedPipeline(selected.value)
          }
          options={extractors.map((el) => ({
            label: el.name,
            value: el.externalId,
          }))}
        />
        <Body style={{ marginTop: 16 }} level={5} strong>
          Data Set*
        </Body>
        <Select
          menuPortalTarget={getContainer()}
          value={
            selectedDataSet
              ? {
                  label:
                    dataSets.find((el) => el.externalId === selectedDataSet)!
                      .name || selectedDataSet,
                  value: selectedDataSet,
                }
              : undefined
          }
          onChange={(selected: { value: string }) =>
            setSelectedDataSet(selected.value)
          }
          options={dataSets
            .filter((el) => !!el.externalId)
            .map((el) => ({
              label: el.name || el.externalId!,
              value: el.externalId!,
            }))}
        />
        <Divider style={{ marginTop: 16 }} />
        <Body level={5} strong>
          Configuration (Enviornment Variables)
        </Body>
        <Flex direction="column" gap={4}>
          {Object.entries(secrets).map(([key, value]) =>
            typeof value !== 'object' ? (
              <Flex key={key} alignItems="center">
                <Body level={3} muted style={{ flex: 1 }}>
                  {key}
                </Body>
                <Flex style={{ flex: 1 }}>
                  <Input
                    fullWidth
                    value={value}
                    type={key.includes('SECRET') ? 'password' : 'text'}
                    onChange={(ev) =>
                      setSecrets((currValue) => ({
                        ...currValue,
                        [key]: ev.target.value,
                      }))
                    }
                  />
                  {!requiredKeys.includes(key) && (
                    <Button
                      icon="Delete"
                      type="ghost-destructive"
                      aria-label="delete"
                      onClick={() =>
                        setSecrets((currValue) => {
                          const newVal = { ...currValue };
                          delete newVal[key];
                          return newVal;
                        })
                      }
                    />
                  )}
                </Flex>
              </Flex>
            ) : null
          )}
          <Flex>
            <Flex style={{ flex: 1 }} gap={6}>
              <Flex style={{ flex: 1 }}>
                <Input
                  fullWidth
                  placeholder="New key"
                  value={newKey}
                  onChange={(ev) => setNewKey(ev.target.value)}
                />
              </Flex>
              <Button
                disabled={!newKey}
                onClick={() => {
                  setSecrets((currValue) => ({
                    ...currValue,
                    [newKey]: '',
                  }));
                  setNewKey('');
                }}
              >
                Add
              </Button>
            </Flex>
            <Flex style={{ flex: 1 }}></Flex>
          </Flex>
        </Flex>
      </Flex>
    </Modal>
  );
};
