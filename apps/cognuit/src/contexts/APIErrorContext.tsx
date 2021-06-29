import React, { useState, useCallback } from 'react';
import { notification } from 'antd';
import noop from 'lodash/fp';
import { CustomError } from 'services/CustomError';

type Props = {
  children: any;
};

export type Values = {
  error: CustomError | null;
  addError: (message: string, status: number) => void;
  removeError: () => void;
};

const APIErrorContext = React.createContext<Values>({
  error: null,
  addError: () => noop,
  removeError: () => noop,
});

const APIErrorProvider = ({ children }: Props) => {
  const [error, setError] = useState<CustomError | null>(null);

  const removeError = () => error && setError(null);

  const addError = (message: string, status: number) => {
    setError(new CustomError(message, status));
    notification.error({
      message: `API error ${status}`,
      description: message,
    });
  };

  const contextValue = {
    error,
    addError: useCallback(
      (message: string, status: number) => addError(message, status),
      []
    ),
    removeError: useCallback(() => removeError(), []),
  };

  return (
    <APIErrorContext.Provider value={contextValue}>
      {children}
    </APIErrorContext.Provider>
  );
};

export { APIErrorProvider };

export default APIErrorContext;
