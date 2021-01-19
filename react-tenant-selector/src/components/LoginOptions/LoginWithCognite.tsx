import * as React from 'react';
import { CogniteAuth } from '@cognite/auth-utils';

import {
  CardFooterError,
  CogniteFlow,
  ClusterSelector,
} from '../../components';
import { sanitizeTenant, errorSchema } from '../../utils';

export type FormState = {
  [name: string]: {
    value: string;
    error: string;
    isValid: boolean;
  };
};

interface Props {
  initialTenant?: string;
  loading: boolean;
  cluster: string;

  handleSubmit: (tenant: string) => void;
  handleClusterSubmit: (tenant: string, cluster: string) => void;
  validateTenant: (tenant: string) => Promise<boolean>;
  validateCluster: (tenant: string, cluster: string) => Promise<boolean>;
  errors?: React.ReactNode[];
  authClient?: CogniteAuth;
}
const LoginWithCognite: React.FC<Props> = ({
  cluster,
  initialTenant,
  loading,
  handleSubmit,
  handleClusterSubmit,
  validateTenant,
  validateCluster,
  errors,
  authClient,
}: Props) => {
  const [clusterSelectorShown, setClusterSelectorShown] = React.useState(false);

  const [formState, setFormState] = React.useState<FormState>({
    tenant: {
      value: initialTenant || '',
      isValid: !!initialTenant,
      error: '',
    },
    cluster: {
      value: '',
      // Cluster is not required field
      isValid: true,
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

  const runValidateTenantProcess = () => {
    if (formState.tenant.isValid) {
      validateTenant(formState.tenant.value)
        .then((isValid) => {
          if (isValid) {
            if (authClient) {
              authClient.login('COGNITE_AUTH', {
                project: formState.tenant.value,
                cluster,
              });
            }
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
  };

  const runValidateClusterProcess = () => {
    validateCluster(formState.tenant.value, formState.cluster.value)
      .then((isValid) => {
        if (isValid) {
          if (authClient) {
            authClient.login('COGNITE_AUTH', {
              project: formState.tenant.value,
              cluster,
            });
          }
          handleClusterSubmit(formState.tenant.value, formState.cluster.value);
        } else {
          setUnknownConfigurationError('cluster');
        }
      })
      .catch((_) => {
        setUnknownConfigurationError('cluster');
      });
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!loading) {
      if (!formState.cluster.value) {
        runValidateTenantProcess();
      } else {
        runValidateClusterProcess();
      }
    }
  };

  const errorList = React.useMemo(() => {
    if (!errors) {
      return null;
    }
    return errors.map((error) => {
      return (
        <CardFooterError style={{ marginTop: '16px' }}>{error}</CardFooterError>
      );
    });
  }, [errors]);

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

  const backToTenantSelector = () => {
    setClusterSelectorShown(false);
    setFormState({
      ...formState,
      cluster: {
        ...formState.cluster,
        value: '',
        error: '',
      },
    });
  };

  return (
    <div>
      {!clusterSelectorShown ? (
        <CogniteFlow
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
          backToTenantSelector={backToTenantSelector}
          handleOnChange={handleOnChange}
          formState={formState}
          loading={loading}
          onSubmit={onSubmit}
        />
      )}
    </div>
  );
};

export default LoginWithCognite;
