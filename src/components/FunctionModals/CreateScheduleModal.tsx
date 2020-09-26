import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Alert } from 'antd';
import { Button, Tooltip } from '@cognite/cogs.js';
import { isValidCron } from 'cron-validator';
import { useMutation, useQueryCache } from 'react-query';
import { createSchedule as createScheduleApi } from 'utils/api';

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
  externalId: string;
};

export default function CreateScheduleModal({ externalId, onCancel }: Props) {
  const queryCache = useQueryCache();
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

  const [
    triggerCreateSchedule,
    { isLoading, isSuccess, isError, error },
  ] = useMutation(createScheduleApi, {
    onSuccess() {
      queryCache.invalidateQueries('/functions/schedules');
      onCancel();
    },
  });

  useEffect(() => {
    if (isSuccess) {
      Modal.success({
        title: 'Schedule created',
        content: `Schedule '${scheduleName.value}' for function ${externalId} created successfully`,
      });
    }
  }, [isSuccess, externalId, scheduleName.value]);

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
    !!externalId &&
    isValidScheduleName(scheduleName.value) &&
    isValidCronExpression(cronExpression.value) &&
    isValidDescription(description) &&
    isValidData(data);

  return (
    <Modal
      title="Create Schedule"
      visible
      footer={null}
      width="550px"
      onCancel={onCancel}
    >
      {isError ? (
        <Alert
          message={`Error: ${JSON.stringify(error, null, 2)}`}
          type="error"
          closable
          showIcon
          style={{ marginBottom: '8px' }}
        />
      ) : null}
      <div style={{ display: 'flow-root' }}>
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

        <div style={{ float: 'right', display: 'inline-flex' }}>
          <Button
            style={{ marginRight: '8px', float: 'left' }}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Tooltip placement="top" content="Fill out the required fields">
            <Button
              type="primary"
              icon={isLoading ? 'Loading' : 'Upload'}
              disabled={!canBeSubmitted && !isLoading}
              onClick={() => {
                triggerCreateSchedule({
                  name: scheduleName.value,
                  functionExternalId: externalId,
                  description,
                  cronExpression: cronExpression.value,
                  data: data === '' ? {} : JSON.parse(data),
                });
              }}
              htmlType="submit"
            >
              {isLoading ? 'Creating' : 'Create'}
            </Button>
          </Tooltip>
        </div>
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
