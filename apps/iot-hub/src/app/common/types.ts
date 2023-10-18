export type IoTDevice = {
  // Make this the same as ext pipeline id!
  id: string;
  name: string;
  latestResponse: string;
  modules: Module[];
};

export type Module = {
  name: string;
  type: 'builtin' | 'extractor' | 'custom';
  deployed: boolean;
  reported: boolean;
  status: boolean;
};

export type ExtractorConfig = {
  requiredCredentials: string[];
  defaultCredentials: { [key in string]: string };
  fixedCredentials: { [key in string]: string };
  dockerImage: string;
  defaultConfig: string;
};