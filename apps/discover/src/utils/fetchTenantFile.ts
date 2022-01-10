export const fetchTenantFile = async (tenant: string, file: string) => {
  const { default: result } = await import(`tenants/${tenant}/${file}`);
  return result;
};
