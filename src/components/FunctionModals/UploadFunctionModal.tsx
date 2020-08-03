import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Upload, Alert } from 'antd';
import { Button, Icon, Tooltip } from '@cognite/cogs.js';
import styled from 'styled-components';
import { UploadChangeParam } from 'antd/lib/upload';
import { useDispatch, useSelector } from 'react-redux';
import {
  uploadFile,
  createFunction,
  selectCreateFunctionState,
  createFunctionReset,
  selectCreateFunctionFields,
  selectUploadFileState,
} from 'modules/create';
import { UploadFile } from 'antd/lib/upload/interface';
import Link from 'components/Link';

const UploadFunctionContentRow = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
`;

const UploadFunctionContentCol = styled.div`
  flex-direction: column;
  flex-basis: 100%;
  flex: 1;
  .ant-col.ant-form-item-label {
    font-weight: bold;
    line-height: inherit;
  }
  .ant-col.ant-form-item-control-wrapper {
    height: 100%;
  }
  .ant-form-item-control {
    height: inherit;
    line-height: inherit;
  }
  .ant-form-item {
    margin-bottom: 8px;
  }
`;

const SecretsDiv = styled.div`
  margin-bottom: 8px;
  display: inline;
  align-items: center;

  .ant-form-item-control {
    width: 150px;
    margin-left: 8px;
    margin-right: 8px;
  }

  .ant-row.ant-form-item {
    display: inline-flex;
  }
`;

const getAllSecretKeys = (secrets: Secret[]) => {
  const keys = [] as string[];
  secrets.forEach((s: Secret) => {
    keys.push(s.key);
  });
  return keys;
};

const checkSecrets = (secrets: Secret[], apiKey: string) => {
  if (secrets.length > 5) {
    return false;
  }

  let allSecretsAreValid = true;
  secrets.forEach((s: Secret) => {
    if (
      checkSecretKey(s.key, apiKey, getAllSecretKeys(secrets)).error ||
      checkSecretValue(s.value).error
    ) {
      allSecretsAreValid = false;
    }
  });

  return allSecretsAreValid;
};

const checkSecretKey = (key: string, apiKey: string, allKeys: string[]) => {
  if (key.length === 0) {
    return {
      error: true,
      message: 'A key is required',
    };
  }
  if (key.length > 15) {
    return {
      error: true,
      message: 'Max 15 characters',
    };
  }
  if (key.match(/[^a-z0-9-]+/g) !== null) {
    return {
      error: true,
      message: 'Only lowercase letters, digits, & dashes allowed',
    };
  }
  if (key === apiKey) {
    return {
      error: true,
      message: 'Key may not be API Key',
    };
  }
  if (allKeys.filter(k => k === key).length > 1) {
    return {
      error: true,
      message: 'Keys must be unique',
    };
  }

  return {
    error: false,
    message: '',
  };
};

const checkSecretValue = (value: string) => {
  if (value.length === 0) {
    return {
      error: true,
      message: 'A value is required',
    };
  }
  return {
    error: false,
    message: '',
  };
};

const checkFunctionName = (functionName: string) => {
  if (functionName.length < 1) {
    return { error: true, message: 'A name is required' };
  }
  if (functionName.length > 140) {
    return {
      error: true,
      message: 'Function name must be only 140 characters',
    };
  }
  return {
    error: false,
    message: '',
  };
};

const checkDescription = (description: string) => {
  if (description.length > 128) {
    return {
      error: true,
      message: 'Description may only be 128 characters',
    };
  }
  return {
    error: false,
    message: '',
  };
};

const checkApiKey = (apiKey: string) => {
  if (apiKey.length > 50) {
    return {
      error: true,
      message: 'API Key may only be 50 characters',
    };
  }
  return {
    error: false,
    message: '',
  };
};

const checkOwner = (owner: string) => {
  if (owner.length > 128) {
    return {
      error: true,
      message: 'Owner may only be 128 characters',
    };
  }
  return {
    error: false,
    message: '',
  };
};

const checkExternalId = (externalId: string) => {
  if (externalId.length > 255) {
    return {
      error: true,
      message: 'External Id may only be 255 characters',
    };
  }
  return {
    error: false,
    message: '',
  };
};

const checkFile = (file?: UploadFile) => {
  if (!file) {
    return {
      error: true,
      message: 'A file is required',
    };
  }
  return {
    error: false,
    message: '',
  };
};

interface Secret {
  key: string;
  value: string;
  keyTouched: boolean;
  valueTouched: boolean;
}

type Props = {
  onCancel: () => void;
  visible: boolean;
};

export default function UploadFunctionModal(props: Props) {
  const { visible, onCancel } = props;
  const { file: fileInStore } = useSelector(selectCreateFunctionFields);
  const {
    creating,
    done: createFunctionDone,
    error: createFunctionError,
    errorMessage: createFunctionErrorMessage,
  } = useSelector(selectCreateFunctionState);
  const { uploading, error: uploadFileError } = useSelector(
    selectUploadFileState
  );
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

  const dispatch = useDispatch();

  if (!file && fileInStore.file) {
    setFile(fileInStore.file);
  }

  const apiKeyTitle = (
    <div style={{ display: 'inline-flex' }}>
      API Key
      <Tooltip
        placement="right"
        content="Can be used inside the function to access data in CDF"
      >
        <Icon
          type="Help"
          style={{ paddingLeft: '8px', display: 'inline-block' }}
        />
      </Tooltip>
    </div>
  );

  const externalIdTitle = (
    <div style={{ display: 'inline-flex' }}>
      External Id
      <Tooltip
        placement="right"
        content="The external id must be unique for its resource type"
      >
        <Icon
          type="Help"
          style={{ paddingLeft: '8px', display: 'inline-block' }}
        />
      </Tooltip>
    </div>
  );

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
  const secretsTitle = () => {
    let addButton = (
      <Button
        icon="Plus"
        size="small"
        style={{
          marginLeft: '24px',
          justifyContent: 'center',
          marginTop: '4px',
        }}
        onClick={addSecret}
      >
        Add a secret
      </Button>
    );

    if (secrets.length >= 5) {
      addButton = (
        <div style={{ display: 'inline-flex' }}>
          <Tooltip placement="right" content="You may only have 5 secrets">
            <Button
              icon="Plus"
              size="small"
              style={{
                marginLeft: '24px',
                justifyContent: 'center',
                marginTop: '4px',
              }}
              disabled
            >
              Add a secret
            </Button>
          </Tooltip>
        </div>
      );
    }

    return (
      <div style={{ display: 'inline-flex', alignItems: 'center' }}>
        <span>Secrets</span>
        {addButton}
      </div>
    );
  };

  const secretsInput = () => {
    return secrets.map((s: Secret, index) => (
      <SecretsDiv key={`secret-${index.toString()}`}>
        <Form.Item
          label="Key"
          required
          validateStatus={
            s.keyTouched &&
            checkSecretKey(s.key, apiKey, getAllSecretKeys(secrets)).error
              ? 'error'
              : 'success'
          }
          help={
            s.keyTouched
              ? checkSecretKey(s.key, apiKey, getAllSecretKeys(secrets)).message
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
        <Form.Item
          label="Value"
          required
          validateStatus={
            s.valueTouched && checkSecretValue(s.value).error
              ? 'error'
              : 'success'
          }
          help={s.valueTouched ? checkSecretValue(s.value).message : undefined}
        >
          <Input
            value={s.value}
            name="value"
            data-idx={index}
            allowClear
            onChange={handleSecretChange}
          />
        </Form.Item>
        <Button
          size="small"
          icon="Minus"
          style={{
            justifyContent: 'center',
            marginLeft: '8px',
            marginTop: '4px',
          }}
          onClick={() => removeSecret(index)}
        />
      </SecretsDiv>
    ));
  };

  const cancelAndUploadButtons = (isUploadDisabled: boolean) => {
    const cancelButton = (
      <Button
        style={{ marginRight: '8px', float: 'left' }}
        onClick={handleCancel}
      >
        Cancel
      </Button>
    );

    let uploadStatusButton = (
      <Button
        type="primary"
        icon="Upload"
        disabled={isUploadDisabled}
        onClick={handleSubmit}
        htmlType="submit"
      >
        Upload
      </Button>
    );

    if (isUploadDisabled) {
      uploadStatusButton = (
        <div style={{ display: 'inline-flex' }}>
          <Tooltip placement="top" content="Please input all required fields">
            <Button type="primary" icon="Upload" disabled>
              Upload
            </Button>
          </Tooltip>
        </div>
      );
    }

    if (creating) {
      uploadStatusButton = <Button icon="Loading">Loading</Button>;
    }
    if (createFunctionDone) {
      uploadStatusButton = (
        <Button icon="Check" onClick={handleCancel} type="primary">
          Done
        </Button>
      );
    }

    return (
      <div style={{ float: 'right', display: 'inline-flex' }}>
        {cancelButton}
        {uploadStatusButton}
      </div>
    );
  };

  const handleFunctionNameChange = (evt: { target: { value: string } }) => {
    setFunctionName({ value: evt.target.value, touched: true });
  };

  const handleDescriptionChange = (evt: { target: { value: string } }) => {
    setDescription(evt.target.value);
  };

  const handleApiKeyChange = (evt: { target: { value: string } }) => {
    setApiKey(evt.target.value);
  };

  const handleOwnerChange = (evt: { target: { value: string } }) => {
    setOwner(evt.target.value);
  };

  const handleExternalIdChange = (evt: { target: { value: string } }) => {
    setExternalId(evt.target.value);
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
  const handleSubmit = (evt: { preventDefault: () => void }) => {
    if (!canBeSubmitted) {
      evt.preventDefault();
      return;
    }

    const formattedSecrets = secrets.reduce((obj, s) => {
      return {
        ...obj,
        [s.key]: s.value,
      };
    }, {});

    dispatch(
      createFunction(
        functionName.value,
        description,
        apiKey,
        owner,
        externalId,
        formattedSecrets
      )
    );
  };

  const handleCancel = () => {
    onCancel();
    dispatch(createFunctionReset());
    setApiKey('');
    setDescription('');
    setFile(undefined);
    setFileTouched(false);
    setFunctionName({ value: '', touched: false });
    setOwner('');
    setExternalId('');
    setSecrets([]);
  };

  const uploadFunctionDiv = () => {
    return (
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
        style={{ marginRight: '24px', height: '75%' }}
      >
        <span>
          Must be a zip file with at least a Python file called{' '}
          <b>handler.py </b>
          with a function named <b>handle</b> with any of following arguments:{' '}
          <b>data</b>, <b>client</b> and <b>secrets</b>. More information can be
          found{' '}
          <Link href="https://docs.cognite.com/api/playground/#tag/Functions">
            here.
          </Link>
        </span>
        <Upload.Dragger
          accept=".zip"
          onChange={handleFileUploadChange}
          beforeUpload={() => false}
          multiple={false}
          fileList={file ? [file] : []}
          disabled={uploading}
          name="fileUpload"
          style={{ marginTop: '8px' }}
        >
          <p className="ant-upload-text">Drag file here</p>
          <p className="ant-upload-text">or</p>
          <p className="ant-upload-text">
            <Button>Browse</Button>
          </p>
        </Upload.Dragger>
      </Form.Item>
    );
  };

  const functionInformation = () => {
    return (
      <div>
        <Form layout="vertical">
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
              name="functionName"
              value={functionName.value}
              allowClear
              onChange={handleFunctionNameChange}
            />
          </Form.Item>
          <Form.Item
            label="Owner"
            validateStatus={checkOwner(owner).error ? 'error' : 'success'}
            help={checkOwner(owner).message}
          >
            <Input
              name="owner"
              value={owner}
              allowClear
              onChange={handleOwnerChange}
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
              name="description"
              value={description}
              allowClear
              onChange={handleDescriptionChange}
            />
          </Form.Item>
          <Form.Item
            label={apiKeyTitle}
            validateStatus={checkApiKey(apiKey).error ? 'error' : 'success'}
            help={checkApiKey(apiKey).message}
          >
            <Input.Password
              name="apiKey"
              visibilityToggle={false}
              value={apiKey}
              allowClear
              onChange={handleApiKeyChange}
            />
          </Form.Item>
          <Form.Item
            label={externalIdTitle}
            validateStatus={
              checkExternalId(externalId).error ? 'error' : 'success'
            }
            help={checkExternalId(externalId).message}
          >
            <Input
              name="externalId"
              value={externalId}
              allowClear
              onChange={handleExternalIdChange}
            />
          </Form.Item>
          <Form.Item label={secretsTitle()}>{secretsInput()}</Form.Item>
        </Form>
      </div>
    );
  };

  const canBeSubmitted =
    !checkFunctionName(functionName.value).error &&
    !checkOwner(owner).error &&
    !checkDescription(description).error &&
    !checkApiKey(apiKey).error &&
    !checkExternalId(externalId).error &&
    checkSecrets(secrets, apiKey) &&
    !checkFile(file).error;

  useEffect(() => {
    if (file) {
      dispatch(uploadFile(file));
    }
  }, [dispatch, file]);

  return (
    <Modal
      title="Upload Function"
      visible={visible}
      footer={null}
      width="975px"
      onCancel={handleCancel}
    >
      {uploadFileError && !uploading ? (
        <Alert
          message="Error: Unable to upload file"
          type="error"
          closable
          showIcon
          style={{ marginBottom: '8px' }}
        />
      ) : undefined}
      {createFunctionError && !creating ? (
        <Alert
          message={`Error: ${createFunctionErrorMessage}`}
          type="error"
          closable
          showIcon
          style={{ marginBottom: '8px' }}
        />
      ) : undefined}
      <UploadFunctionContentRow>
        <UploadFunctionContentCol style={{ lineHeight: '0px' }}>
          {uploadFunctionDiv()}
        </UploadFunctionContentCol>
        <UploadFunctionContentCol>
          {functionInformation()}
          {cancelAndUploadButtons(!canBeSubmitted)}
        </UploadFunctionContentCol>
      </UploadFunctionContentRow>
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
