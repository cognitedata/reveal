/* eslint-disable react/no-array-index-key */

import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Modal,
  Form,
  Input,
  Upload,
  Alert,
  Row,
  Col,
  notification,
} from 'antd';
import { Button, Icon, Dropdown, Tooltip, Menu } from '@cognite/cogs.js';
import { UploadChangeParam } from 'antd/lib/upload';
import { UploadFile } from 'antd/lib/upload/interface';
import Link from 'components/Link';
import { useMutation, useQueryCache } from 'react-query';
import { uploadFunction } from 'utils/api';
import {
  checkSecretKey,
  getAllSecretKeys,
  checkSecretValue,
  checkFunctionName,
  checkOwner,
  checkDescription,
  checkExternalId,
  checkSecrets,
  checkFile,
  checkFloat,
} from 'utils/formValidations';
import ErrorFeedback from 'components/Common/atoms/ErrorFeedback';
import { allFunctionsKey } from 'utils/queryKeys';
import { CogFunctionLimit, Runtime } from 'types';
import FunctionMetadata, {
  MetaType,
} from 'components/FunctionModals/FunctionMetadata';
import { useLimits } from 'utils/hooks';

export interface Secret {
  key: string;
  value: string;
  keyTouched: boolean;
  valueTouched: boolean;
}

type Props = {
  onCancel: () => void;
};

const StyledForm = styled(Form)`
  label {
    font-weight: bold;
  }
  .cogs-icon {
    padding-left: 8px;
  }
  .ant-upload-drag-container {
    display: table-cell;
    vertical-align: middle;
    height: 350px;
  }
`;

export type RuntimeOption = { label: string; value: Runtime };

const runtimes: RuntimeOption[] = [
  { label: 'Python 3.7', value: 'py37' },
  { label: 'Python 3.8', value: 'py38' },
  { label: 'Python 3.9', value: 'py39' },
];

const limitDefaults: CogFunctionLimit = {
  timeoutMinutes: 10,
  cpuCores: { default: 0.25, max: 0.6, min: 0.1 },
  memoryGb: { default: 1, max: 2.5, min: 0.1 },
  runtimes: ['py37', 'py38', 'py39'],
  responseSizeMb: 1,
};

export default function UploadFunctionModal({ onCancel }: Props) {
  const queryCache = useQueryCache();
  const { data: limits = limitDefaults } = useLimits();

  const [doUploadFunction, { isLoading, isError, error }] = useMutation(
    uploadFunction,
    {
      onSuccess(id) {
        notification.success({
          message: 'Function created',
          description: `Fuction ${id} was successfully created`,
        });
        queryCache.invalidateQueries(allFunctionsKey);
        onCancel();
      },
    }
  );

  const disableForm = isLoading;

  const [functionName, setFunctionName] = useState({
    value: '',
    touched: false,
  });
  const [description, setDescription] = useState('');
  const [apiKey] = useState('');
  const [owner, setOwner] = useState('');
  const [externalId, setExternalId] = useState('');
  const [file, setFile] = useState<UploadFile>();
  const [fileTouched, setFileTouched] = useState(false);
  const [secrets, setSecrets] = useState([] as Secret[]);
  const [cpu, setCpu] = useState(String(limits.cpuCores.default));
  const [memory, setMemory] = useState(String(limits.memoryGb.default));
  const [runtime, setRuntime] = useState<RuntimeOption>(runtimes[1]);
  const [metadata, setMetadata] = useState([] as MetaType[]);
  const [dataSetId, setDataSetId] = useState<undefined | number>(undefined);

  const addSecret = () => {
    setSecrets(prevSecrets => [
      ...prevSecrets,
      { key: '', value: '', keyTouched: false, valueTouched: false } as Secret,
    ]);
  };

  const removeSecret = (index: number) => {
    const arr = [...secrets];
    arr.splice(index, 1);
    setSecrets(arr);
  };

  const handleSecretChange = (evt: {
    target: { name: string; value: string; dataset: any };
  }) => {
    const { idx } = evt.target.dataset;
    const changeField = evt.target.name;
    const updatedSecrets = [...secrets];
    if (changeField === 'secret_key') {
      updatedSecrets[idx].key = evt.target.value;
      updatedSecrets[idx].keyTouched = true;
    } else if (changeField === 'secret_value') {
      updatedSecrets[idx].value = evt.target.value;
      updatedSecrets[idx].valueTouched = true;
    }
    setSecrets(updatedSecrets);
  };

  const handleCpuChange = (evt: { target: { value: string } }) => {
    setCpu(evt.target.value);
  };

  const handleMemoryChange = (evt: { target: { value: string } }) => {
    setMemory(evt.target.value);
  };

  const handleFileUploadChange = (evt: UploadChangeParam) => {
    if (evt.file.status === 'removed') {
      setFile(undefined);
      setFileTouched(true);
      evt.fileList = [];
      return;
    }
    setFile(evt.file);
    setFileTouched(true);
    if (evt.fileList.length > 1) {
      evt.fileList.shift();
    }
  };

  const handleSubmit = async (evt: { preventDefault: () => void }) => {
    if (canBeSubmitted) {
      evt.preventDefault();
      doUploadFunction({
        data: {
          name: functionName.value,
          externalId,
          owner,
          cpu: cpu ? parseFloat(cpu) : undefined,
          memory: memory ? parseFloat(memory) : undefined,
          secrets: secrets.reduce(
            (accl, s) => ({ ...accl, [s.key]: s.value }),
            {}
          ),
          metadata: metadata.reduce(
            (accl, s) => ({ ...accl, [s.key]: s.value }),
            {}
          ),
          description,
          runtime: runtime.value,
        },
        file: file!,
        dataSetId,
      });
    }
  };

  const checkCPU = checkFloat(limits.cpuCores.min, limits.cpuCores.max);
  const checkMemory = checkFloat(limits.memoryGb.min, limits.memoryGb.max);
  const isAKS = limits?.vendor === 'aks';

  const canBeSubmitted =
    !!file &&
    !checkFunctionName(functionName.value).error &&
    !checkOwner(owner).error &&
    !checkDescription(description).error &&
    !checkExternalId(externalId).error &&
    checkSecrets(secrets) &&
    !checkCPU(cpu).error &&
    !checkMemory(memory).error &&
    !checkFile(file).error;

  return (
    <Modal
      title="Upload Function"
      visible
      width="975px"
      style={{ top: 20 }}
      onCancel={onCancel}
      footer={[
        <Button key="cance" icon="XLarge" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          type="primary"
          key="upload"
          icon={isLoading ? 'Loading' : 'Upload'}
          disabled={disableForm || !canBeSubmitted}
          onClick={handleSubmit}
          htmlType="submit"
        >
          Upload
        </Button>,
      ]}
    >
      {isError ? (
        <Alert
          message="Error"
          description={
            <>
              <p>An error occured when trying to upload this function.</p>
              <ErrorFeedback error={error} />
            </>
          }
          type="error"
          closable
          showIcon
        />
      ) : undefined}
      <StyledForm layout="vertical">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              label="Function File"
              validateStatus={
                fileTouched && checkFile(file).error ? 'error' : 'success'
              }
              help={
                fileTouched && checkFile(file).error
                  ? 'A file is required'
                  : undefined
              }
              required
              colon={false}
            >
              <Upload.Dragger
                accept=".zip"
                onChange={handleFileUploadChange}
                beforeUpload={() => false}
                multiple={false}
                fileList={file ? [file] : []}
                disabled={isLoading}
                name="fileUpload"
              >
                <p>Drag file here</p>
                <p>or</p>
                <p>
                  <Button>Browse</Button>
                </p>
              </Upload.Dragger>
            </Form.Item>
            <p>
              Must be a zip file with at least a Python file called{' '}
              <b>handler.py </b>
              with a function named <b>handle</b> with any of following
              arguments: <b>data</b>, <b>client</b> <b>secrets</b> and{' '}
              <b>metadata</b>. More information can be found{' '}
              <Link href="https://docs.cognite.com/api/v1/#tag/Functions">
                here.
              </Link>
            </p>
            <Form.Item label="Dataset ID">
              <Input
                disabled={disableForm}
                name="datasetId"
                value={dataSetId}
                allowClear
                type="number"
                onChange={({ target: { value } }) => setDataSetId(+value)}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Function name"
              validateStatus={
                functionName.touched &&
                checkFunctionName(functionName.value).error
                  ? 'error'
                  : 'success'
              }
              help={
                functionName.touched
                  ? checkFunctionName(functionName.value).message
                  : undefined
              }
              required
            >
              <Input
                disabled={disableForm}
                name="functionName"
                value={functionName.value}
                allowClear
                onChange={({ target: { value } }) =>
                  setFunctionName({ value, touched: true })
                }
              />
            </Form.Item>
            <Form.Item
              label="Owner"
              validateStatus={checkOwner(owner).error ? 'error' : 'success'}
              help={checkOwner(owner).message}
            >
              <Input
                disabled={disableForm}
                name="owner"
                value={owner}
                allowClear
                onChange={({ target: { value } }) => setOwner(value)}
              />
            </Form.Item>
            <Form.Item
              label="Description"
              validateStatus={
                checkDescription(description).error ? 'error' : 'success'
              }
              help={checkDescription(description).message}
            >
              <Input.TextArea
                disabled={disableForm}
                name="description"
                value={description}
                allowClear
                onChange={({ target: { value } }) => setDescription(value)}
              />
            </Form.Item>
            <Form.Item
              label={
                <>
                  External Id
                  <Tooltip
                    placement="right"
                    content="The external id must be unique for its resource type"
                  >
                    <Icon type="Help" />
                  </Tooltip>
                </>
              }
              validateStatus={
                checkExternalId(externalId).error ? 'error' : 'success'
              }
              help={checkExternalId(externalId).message}
            >
              <Input
                disabled={disableForm}
                name="externalId"
                value={externalId}
                allowClear
                onChange={({ target: { value } }) => setExternalId(value)}
              />
            </Form.Item>
            <Form.Item
              label="CPU"
              validateStatus={checkCPU(cpu).error ? 'error' : 'success'}
              help={checkCPU(cpu).message}
              style={{ fontWeight: 'bold' }}
            >
              <Input
                name="cpu"
                type="number"
                step="0.05"
                min="0.1"
                max="0.6"
                value={cpu}
                onChange={handleCpuChange}
                disabled={isAKS}
                allowClear
              />
            </Form.Item>
            <Form.Item
              label="Memory"
              validateStatus={checkMemory(memory).error ? 'error' : 'success'}
              help={checkMemory(memory).message}
              style={{ fontWeight: 'bold' }}
            >
              <Input
                name="Memory"
                value={memory}
                type="number"
                step="0.1"
                min="0.1"
                max="2.5"
                onChange={handleMemoryChange}
                disabled={isAKS}
                allowClear
              />
            </Form.Item>
            <Form.Item label="Runtime">
              <Dropdown
                content={
                  <Menu>
                    {runtimes.map(rt => (
                      <Menu.Item key={rt.value} onClick={() => setRuntime(rt)}>
                        {rt.label}
                      </Menu.Item>
                    ))}
                  </Menu>
                }
              >
                <Button icon="ChevronDownCompact" iconPlacement="right">
                  {runtime.label}
                </Button>
              </Dropdown>
            </Form.Item>
            <Form.Item label="Secrets">
              {secrets.map((s: Secret, index) => (
                <Row type="flex" key={`secret-${index}`}>
                  <Col span={10}>
                    <Form.Item
                      label="Key"
                      required
                      validateStatus={
                        s.keyTouched &&
                        checkSecretKey(s.key, getAllSecretKeys(secrets)).error
                          ? 'error'
                          : 'success'
                      }
                      help={
                        s.keyTouched
                          ? checkSecretKey(s.key, getAllSecretKeys(secrets))
                              .message
                          : undefined
                      }
                    >
                      <Input
                        value={s.key}
                        name="secret_key"
                        data-idx={index}
                        allowClear
                        onChange={handleSecretChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={10}>
                    <Form.Item
                      label="Value"
                      required
                      validateStatus={
                        s.valueTouched && checkSecretValue(s.value).error
                          ? 'error'
                          : 'success'
                      }
                      help={
                        s.valueTouched
                          ? checkSecretValue(s.value).message
                          : undefined
                      }
                    >
                      <Input
                        value={s.value}
                        name="secret_value"
                        data-idx={index}
                        allowClear
                        onChange={handleSecretChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <Form.Item label="-">
                      <Button
                        id="btnDeleteSecret"
                        icon="Delete"
                        onClick={() => removeSecret(index)}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              ))}
              {secrets.length >= 5 ? (
                <p>You may only have 5 secrets</p>
              ) : (
                <Button icon="Plus" onClick={addSecret}>
                  Add a secret
                </Button>
              )}
            </Form.Item>
            <FunctionMetadata metadata={metadata} setMetadata={setMetadata} />
          </Col>
        </Row>
      </StyledForm>
    </Modal>
  );
}

export const stuffForUnitTests = {
  checkFunctionName,
  checkFile,
  checkDescription,
  checkExternalId,
  checkOwner,
  checkSecretKey,
  checkSecretValue,
  checkSecrets,
};
