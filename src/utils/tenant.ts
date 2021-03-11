export const validateTenant = async (tenant: string): Promise<boolean> => {
  if (!tenant || tenant.trim().length === 0) {
    return Promise.resolve(false);
  }
  return Promise.resolve(true);
};
