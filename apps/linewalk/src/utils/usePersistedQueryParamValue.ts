import isString from 'lodash/isString';
import qs from 'query-string';
import { useHistory } from 'react-router';
import { useLocation } from 'react-router-dom';

type ValidationFn = (value: string) => boolean;

type UsePersistedQueryParamValue = (
  isLoading: boolean,
  key: string,
  isValidValue?: ValidationFn,
  defaultValue?: string
) => [string, (value: string) => void];

const getSafeValue = (
  inputValue: string | any,
  defaultValue: string,
  isValidValue: ValidationFn
): string => {
  if (!isString(inputValue)) {
    return defaultValue;
  }

  if (!isValidValue(inputValue)) {
    return defaultValue;
  }

  return inputValue;
};

const usePersistedQueryParamValue: UsePersistedQueryParamValue = (
  isLoading,
  key,
  isValidValue = () => true,
  defaultValue = ''
) => {
  const history = useHistory();
  const { search } = useLocation();
  const searchQueryParams = qs.parse(search);
  const searchQueryParamValue = searchQueryParams[key];
  const value = getSafeValue(searchQueryParamValue, defaultValue, isValidValue);

  const setValue = (value: string) => {
    history.replace({
      ...history.location,
      search: qs.stringify(
        {
          ...qs.parse(history.location.search),
          [key]: getSafeValue(value, defaultValue, isValidValue),
        },
        { skipEmptyString: true, skipNull: true }
      ),
    });
  };

  return [value, setValue];
};

export default usePersistedQueryParamValue;
