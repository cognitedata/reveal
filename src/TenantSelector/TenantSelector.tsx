import React from 'react';
import { Title5, Colors } from '@cognite/cogs.js';
import { Form, Input, Button } from 'antd';
import { FormComponentProps } from 'antd/lib/form';

import CardFooterError from 'CardFooterError';
import { StyledTenantSelector, CompanyIdLabel } from './elements';
import { StyledHeading, CogniteMark } from '../elements';

type TenantSelectorFormValues = {
  tenant: string;
};

type Props = FormComponentProps<TenantSelectorFormValues> & {
  handleSubmit: (tenant: string) => void;
  validateTenant: (tenant: string) => Promise<boolean>;
  loading: boolean;
  initialTenant?: string;
  error?: React.ReactNode;
};

export const sanitizeTenant = (tenant: string) =>
  (tenant || '').toLowerCase().replace(/[^a-z0-9-]/g, '');

const TenantSelector = ({
  handleSubmit,
  validateTenant,
  initialTenant,
  loading,
  error,
  form: { getFieldDecorator, validateFields, setFields },
}: Props) => {
  const enhanceTenantInput = getFieldDecorator<TenantSelectorFormValues>(
    'tenant',
    {
      initialValue: initialTenant,
      getValueFromEvent: (event) => sanitizeTenant(event.target.value),
      rules: [
        {
          required: true,
          message: 'Company ID is required',
        },
      ],
    }
  );

  const setUnknownConfigurationError = (tenantValue: string) => {
    const unknownConfigurationError = 'This is an unknown configuration.';

    setFields({
      tenant: {
        value: tenantValue,
        errors: [
          {
            message: unknownConfigurationError,
          },
        ],
      },
    });
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!loading) {
      validateFields((validationErrors, { tenant }) => {
        if (!validationErrors) {
          validateTenant(tenant)
            .then((isValid) => {
              if (isValid) {
                handleSubmit(tenant);
              } else {
                setUnknownConfigurationError(tenant);
              }
            })
            .catch((_) => {
              setUnknownConfigurationError(tenant);
            });
        }
      });
    }
  };

  return (
    <StyledTenantSelector>
      <Title5>Log in to</Title5>

      <StyledHeading className="name">Asset Data Insight</StyledHeading>

      <CogniteMark color={Colors['yellow-4']} />

      <div className="content">
        <Form onSubmit={onSubmit} hideRequiredMark>
          <Form.Item
            label={<CompanyIdLabel>Company ID: </CompanyIdLabel>}
            colon={false}
            className="tenant-selector__company-item"
          >
            {enhanceTenantInput(
              <Input
                autoFocus
                placeholder="Enter Company ID"
                disabled={loading}
              />
            )}
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading}>
            Continue
          </Button>
        </Form>
      </div>

      {error && (
        <CardFooterError style={{ marginTop: '16px' }}>{error}</CardFooterError>
      )}
    </StyledTenantSelector>
  );
};

const enhance = Form.create<Props>({ name: 'tenant_selector' });

export default enhance(TenantSelector);
