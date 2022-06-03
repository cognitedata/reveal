export const fetchTenantFile = async (project: string, file: string) => {
  // error from: plugin:rollup-plugin-dynamic-import-variables
  // Requires the use of extensions in dynamic imports
  const fileSplit = file.split('.');
  const extension = fileSplit.length === 1 ? 'ts' : fileSplit.pop();
  const fileName =
    fileSplit.length === 1 ? fileSplit.pop() : fileSplit.join('.');
  const { default: result } = await import(
    `../tenants/${project}/${fileName}.${extension}`
  );
  return result;
};
