import { useMemo } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@flows/common';
import FormFieldWrapper from '@flows/components/form-field-wrapper';
import { useWorkflowBuilderContext } from '@flows/contexts/WorkflowContext';
import { useFunctions } from '@flows/hooks/functions';
import { useTransformationList } from '@flows/hooks/transformation';
import { ProcessNodeData, ProcessType, ProcessNode } from '@flows/types';
import { collectPages } from '@flows/utils';
import { AutoComplete, Select } from 'antd';
import { DefaultOptionType } from 'antd/lib/select';

import {
  Flex,
  InputExp,
  Body,
  IconType,
  Icon,
  Button,
  Modal,
} from '@cognite/cogs.js';

const { Option } = Select;

export const NodeConfigurationPanel = (): JSX.Element => {
  const { t } = useTranslation();

  const { nodes, changeNodes, focusedProcessNodeId, setFocusedProcessNodeId } =
    useWorkflowBuilderContext();

  const { data } = useTransformationList();
  const transformationList = useMemo(() => collectPages(data), [data]);

  const { data: functionList = [] } = useFunctions();

  const selectedNode = useMemo(() => {
    const n = nodes.find(({ id }) => id === focusedProcessNodeId);
    if (n && !!(n.data as ProcessNodeData).processType) {
      return n as ProcessNode;
    }

    return undefined;
  }, [nodes, focusedProcessNodeId]);

  const nodeOptions: {
    value: ProcessType;
    label: string;
    icon: IconType;
  }[] = [
    {
      value: 'transformation',
      label: t('transformation'),
      icon: 'Code',
    },
    {
      value: 'function',
      label: t('function'),
      icon: 'Function',
    },
  ];

  const itemOptions: DefaultOptionType[] = useMemo(() => {
    const processType = selectedNode?.data.processType;
    switch (processType) {
      case 'transformation':
        return transformationList
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(({ externalId, name }) => ({
            label: name,
            value: externalId,
          }));
      case 'function':
        return functionList
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(({ externalId, name }) => ({
            label: name,
            value: externalId,
          }));
      default:
        return [];
    }
  }, [functionList, transformationList, selectedNode]);

  const handleComponentChange = (value: ProcessType) => {
    changeNodes((nodes) => {
      const node = nodes.find((node) => node.id === selectedNode?.id);
      const nodeData = node?.data as ProcessNodeData;
      nodeData.processType = value;
      nodeData.processExternalId = '';
    });
  };

  const handleItemChange = (value: string) => {
    changeNodes((nodes) => {
      const node = nodes.find((node) => node.id === selectedNode?.id);
      const nodeData = node?.data as ProcessNodeData;
      nodeData.processExternalId = value;
    });
  };

  return (
    <Modal
      onCancel={() => setFocusedProcessNodeId(undefined)}
      hideFooter
      title={t('configure-process')}
      visible
    >
      <Flex direction="column" gap={12}>
        <FormFieldWrapper title={t('process-type')}>
          <Select
            value={selectedNode?.data.processType}
            onChange={handleComponentChange}
          >
            {nodeOptions.map(({ icon, label, value }) => (
              <Option key={value} value={value}>
                <Container>
                  <Icon type={icon} />
                  <Body level={2}>{label}</Body>
                </Container>
              </Option>
            ))}
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper title={t('external-id')}>
          <AutoComplete
            placeholder={t('node-configuration-panel-item-placeholder')}
            options={itemOptions}
            value={selectedNode?.data.processExternalId ?? ''}
            filterOption={(input, option) => {
              if (
                typeof option?.value === 'string' &&
                option.value.toLowerCase().includes(input.toLowerCase())
              ) {
                return true;
              }
              if (
                typeof option?.label === 'string' &&
                option.label.toLowerCase().includes(input.toLowerCase())
              ) {
                return true;
              }
              return false;
            }}
            onChange={handleItemChange}
          />
        </FormFieldWrapper>
        <InputExp
          fullWidth
          name="label"
          label={t('description')}
          placeholder={t('enter-description')}
          value={selectedNode?.data.processDescription ?? ''}
          onChange={(e) => {
            const value = e.target.value;
            changeNodes((nodes) => {
              const node = nodes.find((node) => node.id === selectedNode?.id);
              const nodeData = node?.data as ProcessNodeData;
              nodeData.processDescription = value;
            });
          }}
        />
        <Flex justifyContent="flex-end">
          <Button
            onClick={() => setFocusedProcessNodeId(undefined)}
            type="ghost"
          >
            {t('close')}
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
};

const Container = styled(Flex).attrs({ alignItems: 'center', gap: 8 })`
  height: 100%;
`;
