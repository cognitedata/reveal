import { Secret } from 'components/FunctionModals/UploadFunctionModal';
import { UploadFile } from 'antd/lib/upload/interface';

export const getAllSecretKeys = (secrets: Secret[]) => {
  const keys = [] as string[];
  secrets.forEach((s: Secret) => {
    keys.push(s.key);
  });
  return keys;
};

export const checkSecrets = (secrets: Secret[]) => {
  if (secrets.length > 5) {
    return false;
  }

  let allSecretsAreValid = true;
  secrets.forEach((s: Secret) => {
    if (
      checkSecretKey(s.key, getAllSecretKeys(secrets)).error ||
      checkSecretValue(s.value).error
    ) {
      allSecretsAreValid = false;
    }
  });

  return allSecretsAreValid;
};
export const checkSecretKey = (key: string, allKeys: string[]) => {
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
export const checkMetadataKey = (key: string, allKeys: string[]) => {
  if (key.length === 0) {
    return {
      error: true,
      message: 'A key is required',
    };
  }
  if (key.length > 32) {
    return {
      error: true,
      message: 'Max 32 characters',
    };
  }
  if (allKeys.filter(k => k === key).length > 1) {
    return {
      error: true,
      message: 'Metadata key must be unique',
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

export const checkMetadataValue = (value: string) => {
  if (value.length === 0) {
    return {
      error: true,
      message: 'A value is required',
    };
  }
  if (value.length > 512) {
    return {
      error: true,
      message: 'Max 512 characters',
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

export const checkFloat = (min: number, max: number) => (data: string) => {
  if (data) {
    const e = {
      error: true,
      message: `Number not valid in range [${min}, ${max}]`,
    };
    try {
      const f = parseFloat(data);
      if (f < min || f > max) {
        return e;
      }
    } catch {
      return e;
    }
  }

  return {
    error: false,
    message: '',
  };
};
