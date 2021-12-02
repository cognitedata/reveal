import { queryHelpers, buildQueries } from '@testing-library/react';

type Arguments = any[]; // any[] is the same type used in testing lib unfortunately
const queryAllByCheckbox = (...args: Arguments) => {
  return queryHelpers.queryAllByAttribute('type', args[1], 'checkbox');
};

const getMultipleError = (container: Element | null, args: Arguments) =>
  `Found multiple elements with the type attribute of checkbox: ${container} ${args}`;

const getMissingError = (container: Element | null, args: Arguments) =>
  `Unable to find an element with the type attribute of checkbox : ${container} ${args}`;

const [
  queryByCheckbox,
  getAllByCheckbox,
  getByCheckbox,
  findAllByCheckbox,
  findByCheckbox,
] = buildQueries(queryAllByCheckbox, getMultipleError, getMissingError);

export {
  queryByCheckbox,
  getAllByCheckbox,
  getByCheckbox,
  findAllByCheckbox,
  findByCheckbox,
};
