import {
  Flex,
  InputExp,
  Body,
  IconType,
  Icon,
  Title,
  Button,
} from '@cognite/cogs.js';
import styled from 'styled-components';
import { AutoComplete, Select } from 'antd';
import { useMemo } from 'react';

import { useTranslation } from 'common';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';
import { useTransformationList } from 'hooks/transformation';
import { useFunctions } from 'hooks/functions';
import { collectPages } from 'utils';
import { ProcessNodeData, ProcessType } from 'types';
import { FloatingPanel } from 'components/floating-components-panel/FloatingComponentsPanel';
import { ProcessNode } from 'types';
import { DefaultOptionType } from 'antd/lib/select';
import FormFieldWrapper from 'components/form-field-wrapper';

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
    value: string;
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
    {
      value: 'webhook',
      label: t('webhook'),
      icon: 'FrameTool',
    },
    {
      value: 'workflow',
      label: t('workflow'),
      icon: 'Pipeline',
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
    <FloatingPanel right>
      <Flex alignItems="flex-start" justifyContent="space-between">
        <Flex direction="column">
          <Title level={6}>{t('node-configuration-panel-component')}</Title>
        </Flex>
        <Button
          icon="CloseLarge"
          onClick={() => {
            setFocusedProcessNodeId(undefined);
          }}
          type="ghost"
        />
      </Flex>
      <FormFieldWrapper title={t('process-type')}>
        <Select
          value={selectedNode?.data.processType}
          onChange={handleComponentChange}
          style={{ width: 326 }}
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
          style={{ width: 326, flex: 1 }}
        />
      </FormFieldWrapper>
      <InputExp
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
        style={{ width: 326 }}
      />
    </FloatingPanel>
  );
};

const Container = styled(Flex).attrs({ alignItems: 'center', gap: 8 })`
  height: 100%;
`;
