import React, { useState, useMemo, useEffect, createRef } from 'react';
import CardContainerHeader from 'CardContainerHeader';
import TitleChanger from 'TitleChanger';
import TenantSelector from 'TenantSelector';
import ClusterSelector from 'ClusterSelector';
import LoginTip from 'LoginTip';
import { sanitizeTenant, errorSchema } from 'utils';
import CardFooterError from 'CardFooterError';
import { StyledCardContainer, StyledContentWrapper } from './elements';

export type FormState = {
  [name: string]: {
    value: string;
    error: string;
    isValid: boolean;
  };
};

type Props = {
  handleSubmit: (tenant: string) => void;
  validateTenant: (tenant: string) => Promise<boolean>;
  loading: boolean;
  initialTenant?: string;
  errors?: React.ReactNode[];
  helpLink?: string;
};

const CardContainer = ({
  handleSubmit,
  validateTenant,
  initialTenant,
  loading,
  errors,
  helpLink,
}: Props) => {
  const [clusterSelectorShown, setClusterSelectorShown] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    tenant: {
      value: initialTenant || '',
      isValid: !!initialTenant,
      error: '',
    },
  });

  const [containerHeight, setContainerHeight] = useState('464px');
  const container = createRef<HTMLDivElement>();

  useEffect(() => {
    if (container?.current) {
      if (container.current.clientHeight > 0) {
        setContainerHeight(`${container?.current?.clientHeight}px`);
      }
    }
  }, [container]);

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
    <StyledCardContainer style={{ height: `${containerHeight}` }}>
      <div ref={container}>
        <StyledContentWrapper>
          <TitleChanger />
          <CardContainerHeader />
          {!clusterSelectorShown ? (
            <TenantSelector
              tenant={formState.tenant.value}
              loading={loading}
              errorList={errorList}
              tenantError={formState.tenant.error}
              handleOnChange={handleOnChange}
              onSubmit={onSubmit}
              setClusterSelectorShown={setClusterSelectorShown}
            />
          ) : (
            <ClusterSelector
              setClusterSelectorShown={setClusterSelectorShown}
              handleOnChange={handleOnChange}
              formState={formState}
            />
          )}
        </StyledContentWrapper>
        {/* Can we provide some default link? */}
        <LoginTip helpLink={helpLink || ''} />
      </div>
    </StyledCardContainer>
  );
};

export default CardContainer;
