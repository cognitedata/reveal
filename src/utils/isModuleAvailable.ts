export const isModuleAvailable = (path: string) => {
  try {
    require.resolve(path);
    return true;
  } catch (e) {
    return false;
  }
};
