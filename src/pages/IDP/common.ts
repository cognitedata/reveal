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

// TODO CDFUX-1572 - figure out translation
export function validateDomainInput(
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
      errorMsg: `Invalid domains: ${invalidDomains.join(', ')}`,
      failure: true,
    };
  }

  if (!domains.includes('fusion.cognite.com')) {
    return {
      value: domains,
      validateStatus: 'warning',
      errorMsg:
        'fusion.cognite.com is not present, which may cause Fusion to become inaccessible for the project',
      failure: false,
    };
  }

  return { value: domains };
}
