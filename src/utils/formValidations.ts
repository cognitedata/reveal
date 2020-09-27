import { Secret } from 'components/FunctionModals/UploadFunctionModal';
import { UploadFile } from 'antd/lib/upload/interface';

export const getAllSecretKeys = (secrets: Secret[]) => {
  const keys = [] as string[];
  secrets.forEach((s: Secret) => {
    keys.push(s.key);
  });
  return keys;
};

export const checkSecrets = (secrets: Secret[], apiKey: string) => {
  if (secrets.length > 5) {
    return false;
  }

  let allSecretsAreValid = true;
  secrets.forEach((s: Secret) => {
    if (
      checkSecretKey(s.key, apiKey, getAllSecretKeys(secrets)).error ||
      checkSecretValue(s.value).error
    ) {
      allSecretsAreValid = false;
    }
  });

  return allSecretsAreValid;
};
export const checkSecretKey = (
  key: string,
  apiKey: string,
  allKeys: string[]
) => {
  if (key.length === 0) {
    return {
      error: true,
      message: 'A key is required',
    };
  }
  if (key.length > 15) {
    return {
      error: true,
      message: 'Max 15 characters',
    };
  }
  if (key.match(/[^a-z0-9-]+/g) !== null) {
    return {
      error: true,
      message: 'Only lowercase letters, digits, & dashes allowed',
    };
  }
  if (key === apiKey) {
    return {
      error: true,
      message: 'Key may not be API Key',
    };
  }
  if (allKeys.filter(k => k === key).length > 1) {
    return {
      error: true,
      message: 'Keys must be unique',
    };
  }

  return {
    error: false,
    message: '',
  };
};
export const checkSecretValue = (value: string) => {
  if (value.length === 0) {
    return {
      error: true,
      message: 'A value is required',
    };
  }
  return {
    error: false,
    message: '',
  };
};
export const checkFunctionName = (functionName: string) => {
  if (functionName.length < 1) {
    return { error: true, message: 'A name is required' };
  }
  if (functionName.length > 140) {
    return {
      error: true,
      message: 'Function name must be only 140 characters',
    };
  }
  return {
    error: false,
    message: '',
  };
};
export const checkDescription = (description: string) => {
  if (description.length > 128) {
    return {
      error: true,
      message: 'Description may only be 128 characters',
    };
  }
  return {
    error: false,
    message: '',
  };
};
export const checkApiKey = (apiKey: string) => {
  if (apiKey.length > 50) {
    return {
      error: true,
      message: 'API Key may only be 50 characters',
    };
  }
  return {
    error: false,
    message: '',
  };
};
export const checkOwner = (owner: string) => {
  if (owner.length > 128) {
    return {
      error: true,
      message: 'Owner may only be 128 characters',
    };
  }
  return {
    error: false,
    message: '',
  };
};
export const checkExternalId = (externalId: string) => {
  if (externalId.length > 255) {
    return {
      error: true,
      message: 'External Id may only be 255 characters',
    };
  }
  return {
    error: false,
    message: '',
  };
};
export const checkFile = (file?: UploadFile) => {
  if (!file) {
    return {
      error: true,
      message: 'A file is required',
    };
  }
  return {
    error: false,
    message: '',
  };
};
