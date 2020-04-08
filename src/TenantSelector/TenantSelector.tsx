import React, {
  useState,
  useMemo,
  ChangeEvent,
  useCallback,
  FormEvent,
  MouseEvent,
  useEffect,
} from 'react';
import { Input, Button } from '@cognite/cogs.js';
import { TenantValidator } from 'utils';

type Props = {
  initialTenant?: string;
  validateTenant: TenantValidator;
};

const sanitizeTenant = (input: string): string => {
  return (input || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
};

const TenantSelector = ({ initialTenant = '', validateTenant }: Props) => {
  const [tenantValue, setTenantValue] = useState(() => initialTenant);
  const sanitized = useMemo(() => {
    return sanitizeTenant(tenantValue);
  }, [tenantValue]);

  const isValid = useMemo(() => {
    return sanitized.length > 0 && sanitized.length <= 32;
  }, [sanitized]);

  const [errorMessage, setErrorMessage] = useState(null);

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      validateTenant(sanitized).then((valid) => {
        console.log(`result`, valid);
      });
      return false;
    },
    [sanitized, validateTenant]
  );

  useEffect(() => {
    setErrorMessage(null);
  }, [sanitized]);

  return (
    <form onSubmit={onSubmit}>
      <Input
        value={sanitized}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setTenantValue(e.target.value);
        }}
      />
      {errorMessage}
      <Button type="primary" disabled={!isValid} onClick={onSubmit}>
        Continue
      </Button>
    </form>
  );
};

export default TenantSelector;
