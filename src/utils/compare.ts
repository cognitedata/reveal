import isEmpty from 'lodash/isEmpty';

export const isObjectEmpty = (object: any) => {
  if (isEmpty(object)) {
    return true;
  }

  return Object.keys(object).every(key => {
    return (
      object[key] === undefined || object[key] === null || isEmpty(object[key])
    );
  });
};
