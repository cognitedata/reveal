import { useState, useEffect, useContext } from 'react';
import { useDispatch } from 'react-redux';
import {
  setIsValid,
  setSuite,
  clearForm as clearFormAction,
  clearBoardForm as clearBoardFormAction,
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
import set from 'lodash/set';
import keys from 'lodash/keys';

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

  const clearBoardForm = () => {
    dispatch(clearBoardFormAction());
  };
  const clearForm = () => {
    dispatch(clearFormAction());
  };
  return {
    initForm,
    clearForm,
    clearBoardForm,
  };
};

export type ValidateFieldFunction = (
  name: string,
  value: string | undefined
) => void;
type BoardTouchedFields = {
  [Property in keyof Board]?: boolean;
};

export const useForm = (validations: Validator) => {
  const dispatch = useDispatch<RootDispatcher>();
  const [errors, setErrors] = useState<any>({});
  const [touched, setTouched] = useState<BoardTouchedFields>({});

  useEffect(() => {
    dispatch(
      setIsValid(
        isEmpty(errors) || values(errors).every((error) => isEqual(error, ''))
      )
    );
  }, [errors, dispatch]);

  const clearErrors = () => {
    setTouched({});
    setErrors({});
  };

  const validateFieldValue: ValidateFieldFunction = (
    name: string,
    value: string | undefined
  ) => {
    const rules: ValidationRules = validations[name];

    if (!rules) return '';
    if (rules.required) {
      if (!value?.trim()) {
        return rules.required.message || 'required field';
      }
    }
    if (rules.pattern && value) {
      if (!new RegExp(rules.pattern.value).exec(value as string)) {
        return rules.pattern.message || 'invalid field';
      }
    }
    if (rules.validate && isFunction(rules.validate) && value) {
      const validationError = rules.validate(value);
      return validationError;
    }
    return '';
  };

  const validateField: ValidateFieldFunction = (
    name: string,
    value: string | undefined
  ) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prevState: Suite) => ({
      ...prevState,
      [name]: validateFieldValue(name, value),
    }));
  };

  const validateBoard = (board: Board) => {
    const boardErrors = {} as Board;
    keys(validations).forEach((fieldName) => {
      const value = board[fieldName as keyof Board] || '';
      set(
        boardErrors,
        fieldName,
        validateFieldValue(fieldName, value as string)
      );
    });
    setErrors(boardErrors);
  };

  return {
    validateField,
    validateBoard,
    errors,
    setErrors,
    touched,
    clearErrors,
  };
};
