import React, { useState, useEffect } from 'react';

import styled from 'styled-components';

import { createSchedule as createScheduleApi } from '@functions-ui/utils/api';
import { allSchedulesKey } from '@functions-ui/utils/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Form, Input, Alert, notification } from 'antd';
import { isValidCron } from 'cron-validator';

import { Button, Tooltip } from '@cognite/cogs.js';

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
  externalId?: string;
  id?: number;
};

export default function CreateScheduleModal({
  id,
  externalId,
  onCancel,
}: Props) {
  const queryCache = useQueryClient();

  const [scheduleName, setScheduleName] = useState({
    value: '',
    touched: false,
  });
  const [cronExpression, setCronExpression] = useState({
    value: '',
    touched: false,
  });
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
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
  const handleClientIdChange = (evt: { target: { value: string } }) => {
    setClientId(evt.target.value);
  };
  const handleClientSecretChange = (evt: { target: { value: string } }) => {
    setClientSecret(evt.target.value);
  };

  const handleDataChange = (evt: { target: { value: string } }) => {
    setData(evt.target.value);
  };

  const {
    mutate: triggerCreateSchedule,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useMutation(createScheduleApi, {
    onSuccess() {
      queryCache.invalidateQueries([allSchedulesKey]);
      onCancel();
    },
  });

  useEffect(() => {
    if (isSuccess) {
      notification.success({
        message: 'Schedule created',
        description: `Schedule '${scheduleName.value}' for function ${externalId} created successfully`,
        key: 'schedules',
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
    isValidScheduleName(scheduleName.value) &&
    isValidCronExpression(cronExpression.value) &&
    isValidDescription(description) &&
    isValidData(data);

  return (
    <Modal
      title="Create Schedule"
      open={true}
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
            <HelperText>
              The time zone for the{' '}
              <a
                href="https://docs.cognite.com/cdf/functions/#schedule-a-function"
                target="_blank"
                rel="noreferrer"
              >
                cron expression is UTC
              </a>
            </HelperText>
            <Input
              name="cronExpression"
              value={cronExpression.value}
              onChange={handleCronExpressionChange}
              allowClear
            />
          </Form.Item>
          <Form.Item label="Client ID" required style={{ fontWeight: 'bold' }}>
            <Input
              name="clientId"
              value={clientId}
              onChange={handleClientIdChange}
              allowClear
            />
          </Form.Item>
          <Form.Item
            label="Client Secret"
            required
            style={{ fontWeight: 'bold' }}
          >
            <Input.Password
              name="clientSecret"
              value={clientSecret}
              onChange={handleClientSecretChange}
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
              icon={isLoading ? 'Loader' : 'Upload'}
              disabled={!canBeSubmitted && !isLoading}
              onClick={() => {
                triggerCreateSchedule({
                  schedule: {
                    name: scheduleName.value,
                    description,
                    cronExpression: cronExpression.value,
                    data: data === '' ? {} : JSON.parse(data),
                    functionId: id,
                  },
                  clientCredentials: { clientId, clientSecret },
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

const HelperText = styled.div`
  font-weight: 400;
  font-size: 85%;
`;

export const stuffForUnitTests = {
  isValidScheduleName,
  isValidCronExpression,
  isValidDescription,
  isValidData,
};
