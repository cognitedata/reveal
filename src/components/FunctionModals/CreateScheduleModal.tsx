import React, { useState } from 'react';
import { Modal, Form, Input, Alert } from 'antd';
import { Button, Tooltip } from '@cognite/cogs.js';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCreateScheduleState,
  createSchedule,
  createScheduleReset,
} from 'modules/schedules';
import { isValidCron } from 'cron-validator';

const isValidData = (data: string) => {
  if (data === '') {
    return true;
  }
  try {
    JSON.parse(data);
    return (
      typeof JSON.parse(data) === 'object' && !Array.isArray(JSON.parse(data))
    );
  } catch {
    return false;
  }
};

const isValidScheduleName = (scheduleName: string) =>
  scheduleName.length >= 1 && scheduleName.length <= 140;

const isValidDescription = (description: string) => description.length <= 500;

const isValidCronExpression = (cronExpression: string) =>
  !!cronExpression &&
  isValidCron(cronExpression, { alias: true }) &&
  !cronExpression.endsWith(' ') &&
  cronExpression.length <= 1024;

type Props = {
  onCancel: () => void;
  visible: boolean;
  functionExternalId: string;
};

export default function CreateScheduleModal(props: Props) {
  const { visible, onCancel, functionExternalId } = props;
  const { creating, done, error, errorMessage } = useSelector(
    selectCreateScheduleState
  );
  const [scheduleName, setScheduleName] = useState({
    value: '',
    touched: false,
  });
  const [cronExpression, setCronExpression] = useState({
    value: '',
    touched: false,
  });
  const [description, setDescription] = useState('');
  const [data, setData] = useState('');

  const dispatch = useDispatch();

  const cancelAndCreateButtons = (isCreateDisabled: boolean) => {
    const cancelButton = (
      <Button
        style={{ marginRight: '8px', float: 'left' }}
        onClick={handleCancel}
      >
        Cancel
      </Button>
    );

    let createStatusButton = (
      <Button
        type="primary"
        icon="Upload"
        disabled={isCreateDisabled}
        onClick={handleCreate}
        htmlType="submit"
      >
        Create
      </Button>
    );

    if (isCreateDisabled) {
      createStatusButton = (
        <Tooltip placement="top" content="Fill out the required fields">
          <Button type="primary" icon="Upload" disabled>
            Create
          </Button>
        </Tooltip>
      );
    }

    if (creating) {
      createStatusButton = (
        <Button icon="Loading" type="primary">
          Creating
        </Button>
      );
    }
    if (done) {
      createStatusButton = (
        <Button icon="Check" onClick={handleCancel} type="primary">
          Done
        </Button>
      );
    }

    return (
      <div style={{ float: 'right', display: 'inline-flex' }}>
        {cancelButton}
        {createStatusButton}
      </div>
    );
  };

  const handleScheduleNameChange = (evt: { target: { value: string } }) => {
    setScheduleName({ value: evt.target.value, touched: true });
  };

  const handleCronExpressionChange = (evt: { target: { value: string } }) => {
    setCronExpression({ value: evt.target.value, touched: true });
  };
  const handleDescriptionChange = (evt: { target: { value: string } }) => {
    setDescription(evt.target.value);
  };

  const handleDataChange = (evt: { target: { value: string } }) => {
    setData(evt.target.value);
  };

  const getCronExpressionHelpMessage = () => {
    if (cronExpression.touched) {
      if (!isValidCronExpression(cronExpression.value)) {
        return 'A valid cron expression is required';
      }
      return <span style={{ color: 'green' }}>Cron expression is valid</span>;
    }
    return undefined;
  };

  const canBeSubmitted =
    functionExternalId &&
    isValidScheduleName(scheduleName.value) &&
    isValidCronExpression(cronExpression.value) &&
    isValidDescription(description) &&
    isValidData(data);

  const handleCreate = (evt: { preventDefault: () => void }) => {
    if (!canBeSubmitted) {
      evt.preventDefault();
    }
    const formattedData = data === '' ? {} : JSON.parse(data);

    dispatch(
      createSchedule(
        scheduleName.value,
        description,
        cronExpression.value,
        formattedData,
        functionExternalId
      )
    );
  };

  const handleCancel = () => {
    onCancel();
    dispatch(createScheduleReset());
    setScheduleName({ value: '', touched: false });
    setCronExpression({ value: '', touched: false });
    setDescription('');
    setData('');
  };

  const scheduleInformation = () => {
    return (
      <div>
        <Form layout="vertical">
          <Form.Item
            label="Schedule Name"
            required
            style={{ fontWeight: 'bold' }}
            validateStatus={
              scheduleName.touched && !isValidScheduleName(scheduleName.value)
                ? 'error'
                : 'success'
            }
            help={
              scheduleName.touched && !isValidScheduleName(scheduleName.value)
                ? 'A name less than 140 chracters is required'
                : undefined
            }
          >
            <Input
              name="scheduleName"
              value={scheduleName.value}
              onChange={handleScheduleNameChange}
              allowClear
            />
          </Form.Item>
          <Form.Item
            label="Cron Expression"
            required
            style={{ fontWeight: 'bold' }}
            validateStatus={
              cronExpression.touched &&
              !isValidCronExpression(cronExpression.value)
                ? 'error'
                : 'success'
            }
            help={getCronExpressionHelpMessage()}
          >
            <Input
              name="cronExpression"
              value={cronExpression.value}
              onChange={handleCronExpressionChange}
              allowClear
            />
          </Form.Item>
          <Form.Item
            label="Description"
            validateStatus={
              isValidDescription(description) ? 'success' : 'error'
            }
            help={
              !isValidDescription(description)
                ? 'Description must be less than 500 characters'
                : undefined
            }
            style={{ fontWeight: 'bold' }}
          >
            <Input.TextArea
              name="description"
              value={description}
              onChange={handleDescriptionChange}
              allowClear
            />
          </Form.Item>
          <Form.Item
            label="Data"
            validateStatus={isValidData(data) ? 'success' : 'error'}
            help={
              !isValidData(data)
                ? 'Data must be a valid JSON object'
                : undefined
            }
            style={{ fontWeight: 'bold' }}
          >
            <Input.TextArea
              name="data"
              value={data}
              onChange={handleDataChange}
              allowClear
            />
          </Form.Item>
        </Form>
      </div>
    );
  };

  return (
    <Modal
      title="Create Schedule"
      visible={visible}
      footer={null}
      width="550px"
      onCancel={handleCancel}
    >
      {error && !creating ? (
        <Alert
          message={`Error: ${errorMessage}`}
          type="error"
          closable
          showIcon
          style={{ marginBottom: '8px' }}
        />
      ) : undefined}
      <div style={{ display: 'flow-root' }}>
        {scheduleInformation()}
        {cancelAndCreateButtons(!canBeSubmitted)}
      </div>
    </Modal>
  );
}

export const stuffForUnitTests = {
  isValidScheduleName,
  isValidCronExpression,
  isValidDescription,
  isValidData,
};
