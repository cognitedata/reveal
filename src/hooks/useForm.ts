import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setHasError } from 'store/forms/actions';
import { Suite, Board } from 'store/suites/types';
import isFunction from 'lodash/isFunction';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import values from 'lodash/values';
import { TS_FIX_ME } from 'types/core';
import { RootDispatcher } from 'store/types';

export const useFormState = (initBoard: Board, initSuite: Suite) => {
  const [board, setBoard] = useState<Board>(initBoard);
  const [suite, setSuite] = useState<Suite>(initSuite);
  return {
    suite,
    setSuite,
    board,
    setBoard,
  };
};

export const useForm = (validations?: TS_FIX_ME) => {
  const [errors, setErrors] = useState<any>({});
  const dispatch = useDispatch<RootDispatcher>();

  useEffect(() => {
    dispatch(
      setHasError(
        !isEmpty(errors) && values(errors).every((error) => isEqual(error, ''))
      )
    );
  }, [errors, dispatch, validations]);

  const validateField = (name: string, value: string) => {
    const rules = validations[name];

    if (!rules) return '';
    if (rules.required) {
      if (!value.trim()) {
        return rules.required.message || 'required field';
      }
    }
    if (rules.pattern) {
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
