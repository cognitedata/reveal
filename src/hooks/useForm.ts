import { useState, useEffect, useContext } from 'react';
import { useDispatch } from 'react-redux';
import {
  setHasError,
  setSuite,
  clearForm as clearFormState,
} from 'store/forms/actions';
import { Suite, Board } from 'store/suites/types';
import isFunction from 'lodash/isFunction';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import values from 'lodash/values';
import { RootDispatcher } from 'store/types';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { setBoardState } from 'store/forms/thunks';
import { Validator, ValidationRules } from 'validators';

export const useFormState = () => {
  const dispatch = useDispatch<RootDispatcher>();
  const client = useContext(CdfClientContext);
  const [initialStateDispatched, setInitialStateDispatched] = useState(false);

  const initForm = (suite?: Suite, board?: Board) => {
    if (!initialStateDispatched) {
      if (suite) dispatch(setSuite(suite));
      if (board) {
        dispatch(setBoardState(client, board));
      }
      setInitialStateDispatched(true);
    }
  };

  const clearForm = () => {
    dispatch(clearFormState());
  };
  return {
    initForm,
    clearForm,
  };
};

export const useForm = (validations: Validator) => {
  const [errors, setErrors] = useState<any>({});
  const dispatch = useDispatch<RootDispatcher>();

  useEffect(() => {
    dispatch(
      setHasError(
        isEmpty(errors) || values(errors).every((error) => isEqual(error, ''))
      )
    );
  }, [errors, dispatch]);

  const validateField = (name: string, value: string) => {
    const rules: ValidationRules = validations[name];

    if (!rules) return '';
    if (rules.required) {
      if (!value.trim()) {
        return rules.required.message || 'required field';
      }
    }
    if (rules.pattern && value) {
      if (!new RegExp(rules.pattern.value).exec(value)) {
        return rules.pattern.message || 'invalid field';
      }
    }
    if (rules.validate && isFunction(rules.validate)) {
      const validationError = rules.validate(value);
      return validationError;
    }
    return '';
  };

  return {
    validateField,
    errors,
    setErrors,
  };
};
