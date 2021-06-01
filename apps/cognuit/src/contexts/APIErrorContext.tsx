import React, { useState, useCallback } from 'react';
import { notification } from 'antd';
import noop from 'lodash/fp';

type Props = {
  children: any;
};

type ErrorType = {
  message: string;
  status: number;
};

export type Values = {
  error: ErrorType | null;
  addError: (message: string, status: number) => void;
  removeError: () => void;
};

const APIErrorContext = React.createContext<Values>({
  error: null,
  addError: () => noop,
  removeError: () => noop,
});

const APIErrorProvider = ({ children }: Props) => {
  const [error, setError] = useState<ErrorType | null>(null);

  const removeError = () => setError(null);

  const addError = (message: string, status: number) => {
    setError({ message, status });
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
