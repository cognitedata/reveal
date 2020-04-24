import React, { useState, useMemo } from 'react';
import { Title5, Colors, Button, Input } from '@cognite/cogs.js';
import { useTranslation } from 'react-i18next';

import CardFooterError from 'CardFooterError';
import { getSidecar, sanitizeTenant, errorSchema } from 'utils';
import { StyledHeading, CogniteMark } from 'styles/elements';
import { StyledTenantSelector } from './elements';

type Props = {
  handleSubmit: (tenant: string) => void;
  validateTenant: (tenant: string) => Promise<boolean>;
  loading: boolean;
  initialTenant?: string;
  errors?: React.ReactNode[];
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
  errors,
}: Props) => {
  const { t } = useTranslation('TenantSelector');
  const { appName, applicationId } = getSidecar();

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
      // if there is going to be more that one input field in the form we would
      // need to loop through fieldsName array and submit only if all validation
      // functions return isValid = true
      const formValid = Object.values(formState).every(
        ({ isValid }) => isValid
      );
      if (formValid) {
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

  const tenantError = useMemo(() => {
    if (!formState.tenant.error) {
      return '';
    }
    return t('tenant-required_error', {
      defaultValue: formState.tenant.error,
    });
  }, [t, formState.tenant.error]);

  const errorList = useMemo(() => {
    if (!errors) {
      return null;
    }
    return errors.map((error) => {
      return (
        <CardFooterError style={{ marginTop: '16px' }}>{error}</CardFooterError>
      );
    });
  }, [errors]);

  return (
    <StyledTenantSelector>
      <Title5>
        {t('log-in-header', {
          defaultValue: 'Log in to:',
        })}
      </Title5>

      <StyledHeading className="name">
        {t(`app-name_${applicationId}`, { defaultValue: appName })}
      </StyledHeading>

      <CogniteMark color={Colors['yellow-4']} />

      <div className="content">
        <form onSubmit={onSubmit}>
          <div className="tenant-selector__company-item">
            <Input
              autoFocus
              title={t('company-id_input_title', {
                defaultValue: 'Company ID:',
              })}
              id="tenant"
              name="tenant"
              placeholder={t('company-id_input_placeholder', {
                defaultValue: 'Enter Company ID',
              })}
              size="large"
              value={formState.tenant.value}
              onChange={handleOnChange}
              error={tenantError}
              disabled={loading}
            />
          </div>

          <Button type="primary" onClick={onSubmit} loading={loading}>
            {t('continue_button', { defaultValue: 'Continue' })}
          </Button>
        </form>
      </div>
      {errorList}
    </StyledTenantSelector>
  );
};

export default TenantSelector;
