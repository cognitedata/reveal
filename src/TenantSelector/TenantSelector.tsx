import React, { useState } from 'react';
import { Title5, Colors, Button, Input } from '@cognite/cogs.js';

import CardFooterError from 'CardFooterError';
import { getSidecar, sanitizeTenant, errorSchema } from 'utils';
import { StyledHeading, CogniteMark } from 'styles/elements';
import { StyledTenantSelector } from './elements';

type Props = {
  handleSubmit: (tenant: string) => void;
  validateTenant: (tenant: string) => Promise<boolean>;
  loading: boolean;
  initialTenant?: string;
  error?: React.ReactNode;
};

type FormState = {
  [name: string]: {
    value: string;
    error: string;
    isValid: boolean;
  };
};

const TenantSelector = ({
  handleSubmit,
  validateTenant,
  initialTenant,
  loading,
  error,
}: Props) => {
  const { appName } = getSidecar();

  const [formState, setFormState] = useState<FormState>({
    tenant: {
      value: initialTenant || '',
      isValid: false,
      error: '',
    },
  });

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const sanitizedValue = sanitizeTenant(value);
    if (!value) {
      setFormState({
        ...formState,
        [name]: {
          value: sanitizedValue,
          error: errorSchema[name].requiredMessage,
          isValid: false,
        },
      });
    } else {
      setFormState({
        ...formState,
        [name]: { value: sanitizedValue, error: '', isValid: true },
      });
    }
  };

  const setUnknownConfigurationError = (name: string) => {
    setFormState({
      ...formState,
      [name]: {
        ...formState[name],
        error: errorSchema[name].validationMessage,
        isValid: false,
      },
    });
  };

  const setRequiredError = (name: string) => {
    setFormState({
      ...formState,
      [name]: {
        ...formState[name],
        error: errorSchema[name].requiredMessage,
        isValid: false,
      },
    });
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!loading) {
      const fieldsName = Object.keys(formState);
      // if there is going to be more that one input field in the form we would need to loop through fieldsName array
      // and submit only if all validation functions return isValid = true
      if (fieldsName.every((field: string) => formState[field].isValid)) {
        validateTenant(formState.tenant.value)
          .then((isValid) => {
            if (isValid) {
              handleSubmit(formState.tenant.value);
            } else {
              setUnknownConfigurationError('tenant');
            }
          })
          .catch((_) => {
            setUnknownConfigurationError('tenant');
          });
      } else {
        setRequiredError('tenant');
      }
    }
  };

  return (
    <StyledTenantSelector>
      <Title5>Log in to</Title5>

      <StyledHeading className="name">{appName}</StyledHeading>

      <CogniteMark color={Colors['yellow-4']} />

      <div className="content">
        <form onSubmit={onSubmit}>
          <div className="tenant-selector__company-item">
            <Input
              autoFocus
              title="Company ID:"
              id="tenant"
              name="tenant"
              placeholder="Enter Company ID"
              size="large"
              value={formState.tenant.value}
              onChange={handleOnChange}
              error={formState.tenant.error}
              disabled={loading}
            />
          </div>

          <Button type="primary" onClick={onSubmit} loading={loading}>
            Continue
          </Button>
        </form>
      </div>

      {error && (
        <CardFooterError style={{ marginTop: '16px' }}>{error}</CardFooterError>
      )}
    </StyledTenantSelector>
  );
};

export default TenantSelector;
