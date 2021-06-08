type Configuration = {
  [key: string]: string | number | boolean | Configuration;
};

export const mergeConfiguration = (
  defaultConfig: Configuration,
  overrideConfig: Configuration
) => {
  return {
    ...defaultConfig,
    ...overrideConfig,
  };
};
