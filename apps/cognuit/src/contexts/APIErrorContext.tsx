import React, { useState, useCallback } from 'react';
import noop from 'lodash/fp';
import { CustomError } from 'services/CustomError';
import { reportException } from '@cognite/react-errors';
import { notification } from 'components/Molecules/notification';

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
    const error = new CustomError(message, status);
    setError(error);
    notification.error({
      message: `API error ${status}`,
      description: message,
    });
    reportException(error);
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
