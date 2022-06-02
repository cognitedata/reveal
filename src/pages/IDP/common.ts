export type Value<T> = {
  value: T;
  validateStatus?: '' | 'error' | 'success' | 'warning' | 'validating';
  errorMsg?: string;
  failure?: boolean;
};

export function validateDomain(
  domain: string,
  wildcardSupported: boolean = false
): boolean {
  const labels = domain.split('.');
  const regex = wildcardSupported
    ? /^([a-zA-Z0-9*]([a-zA-Z0-9*-]*[a-zA-Z0-9*])?)$/
    : /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
  return labels.every((label) => regex.test(label));
}

export function validateDomainInput(
  _t: any,
  domains: string[],
  wildcardSupported: boolean = false
): Value<string[]> {
  const invalidDomains = domains.filter(
    (domain) => !validateDomain(domain, wildcardSupported)
  );
  if (invalidDomains.length > 0) {
    return {
      value: domains,
      validateStatus: 'error',
      errorMsg: _t('error-invalid-domain', {
        domains: invalidDomains.join(', '),
      }),
      failure: true,
    };
  }

  if (!domains.includes('fusion.cognite.com')) {
    return {
      value: domains,
      validateStatus: 'warning',
      errorMsg: _t('error-invalid-domain-desc'),
      failure: false,
    };
  }

  return { value: domains };
}
