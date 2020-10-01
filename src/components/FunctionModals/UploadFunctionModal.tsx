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
import { Button, Icon, Tooltip } from '@cognite/cogs.js';
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
  checkApiKey,
  checkExternalId,
  checkSecrets,
  checkFile,
} from 'utils/formValidations';
import ErrorFeedback from 'components/Common/atoms/ErrorFeedback';
import { allFunctionsKey } from 'utils/queryKeys';

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

export default function UploadFunctionModal({ onCancel }: Props) {
  const queryCache = useQueryCache();

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
  const [apiKey, setApiKey] = useState('');
  const [owner, setOwner] = useState('');
  const [externalId, setExternalId] = useState('');
  const [file, setFile] = useState<UploadFile>();
  const [fileTouched, setFileTouched] = useState(false);
  const [secrets, setSecrets] = useState([] as Secret[]);

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
    if (changeField === 'key') {
      updatedSecrets[idx].key = evt.target.value;
      updatedSecrets[idx].keyTouched = true;
    } else if (changeField === 'value') {
      updatedSecrets[idx].value = evt.target.value;
      updatedSecrets[idx].valueTouched = true;
    }
    setSecrets(updatedSecrets);
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
          apiKey,
          secrets: secrets.reduce(
            (accl, s) => ({ ...accl, [s.key]: s.value }),
            {}
          ),
          description,
        },
        file: file!,
      });
    }
  };

  const canBeSubmitted =
    !!file &&
    !checkFunctionName(functionName.value).error &&
    !checkOwner(owner).error &&
    !checkDescription(description).error &&
    !checkApiKey(apiKey).error &&
    !checkExternalId(externalId).error &&
    checkSecrets(secrets, apiKey) &&
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
              arguments: <b>data</b>, <b>client</b> and <b>secrets</b>. More
              information can be found{' '}
              <Link href="https://docs.cognite.com/api/playground/#tag/Functions">
                here.
              </Link>
            </p>
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
                  API Key
                  <Tooltip
                    placement="right"
                    content="Can be used inside the function to access data in CDF"
                  >
                    <Icon type="Help" />
                  </Tooltip>
                </>
              }
              validateStatus={checkApiKey(apiKey).error ? 'error' : 'success'}
              help={checkApiKey(apiKey).message}
            >
              <Input.Password
                disabled={disableForm}
                name="apiKey"
                visibilityToggle={false}
                value={apiKey}
                allowClear
                onChange={({ target: { value } }) => setApiKey(value)}
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
            <Form.Item label="Secrets">
              {secrets.map((s: Secret, index) => (
                <Row type="flex" key={`secret-${index}`}>
                  <Col span={10}>
                    <Form.Item
                      label="Key"
                      required
                      validateStatus={
                        s.keyTouched &&
                        checkSecretKey(s.key, apiKey, getAllSecretKeys(secrets))
                          .error
                          ? 'error'
                          : 'success'
                      }
                      help={
                        s.keyTouched
                          ? checkSecretKey(
                              s.key,
                              apiKey,
                              getAllSecretKeys(secrets)
                            ).message
                          : undefined
                      }
                    >
                      <Input
                        value={s.key}
                        name="key"
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
                        name="value"
                        data-idx={index}
                        allowClear
                        onChange={handleSecretChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <Form.Item label="-">
                      <Button
                        icon="Minus"
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
          </Col>
        </Row>
      </StyledForm>
    </Modal>
  );
}

export const stuffForUnitTests = {
  checkFunctionName,
  checkFile,
  checkApiKey,
  checkDescription,
  checkExternalId,
  checkOwner,
  checkSecretKey,
  checkSecretValue,
  checkSecrets,
};
