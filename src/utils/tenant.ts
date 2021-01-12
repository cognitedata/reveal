export const validateTenant = async (tenant: string): Promise<boolean> => {
  if (!tenant || tenant.trim().length === 0) {
    return Promise.resolve(false);
  }
  // TODO(DTC-162) validate tenant on middleware
  return Promise.resolve(true);
};
