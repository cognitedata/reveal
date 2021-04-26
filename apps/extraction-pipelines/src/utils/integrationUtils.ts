import moment from 'moment';
import { User } from 'model/User';
import { DetailFieldNames } from 'model/Integration';
import { FieldValues } from 'react-hook-form';
import { LastStatuses, Status, StatusObj } from 'model/Status';

export const calculateStatus = (status: LastStatuses): StatusObj => {
  return calculate(status);
};
export const calculate = ({
  lastFailure,
  lastSuccess,
}: LastStatuses): StatusObj => {
  if (
    (lastSuccess && lastSuccess > 0 && lastFailure === 0) ||
    (lastSuccess && moment(lastSuccess).isAfter(moment(lastFailure)))
  ) {
    return {
      status: Status.OK,
      time: lastSuccess,
    };
  }
  if (
    (lastFailure && lastFailure > 0 && lastSuccess === 0) ||
    (lastFailure &&
      lastSuccess &&
      moment(lastFailure).isAfter(moment(lastSuccess)))
  ) {
    return {
      status: Status.FAIL,
      time: lastFailure,
    };
  }
  if (
    lastFailure &&
    lastSuccess &&
    moment(lastFailure).isSame(moment(lastSuccess))
  ) {
    return {
      status: Status.FAIL,
      time: lastFailure,
    };
  }
  return {
    status: Status.NOT_ACTIVATED,
    time: 0,
  };
};

type Partitioned<T> = Readonly<{ pass: Readonly<T[]>; fail: Readonly<T[]> }>;
export const partition = <T>(
  list: Array<T>,
  predicate: (item: T) => boolean
): Partitioned<T> => {
  return list.reduce(
    (acc: { pass: T[]; fail: T[] }, current: T) => {
      return predicate(current)
        ? { ...acc, pass: [...acc.pass, current] }
        : { ...acc, fail: [...acc.fail, current] };
    },
    { pass: [], fail: [] }
  );
};

export const isOwner = (contact: User): boolean => {
  return (
    !!contact.role &&
    contact.role.toLowerCase() === DetailFieldNames.OWNER.toLowerCase()
  );
};

export const updateContactField = (
  contacts: User[],
  fieldName: keyof User,
  idx: number
) => {
  return contacts.map((c: User, i: number) => {
    if (i === idx) {
      return { ...c, ...{ [fieldName]: !c[fieldName] } };
    }
    return c;
  });
};

export const updateContact = (
  contacts: User[],
  contactField: FieldValues,
  index: number
) => {
  return contacts.map((c: User, i: number) => {
    if (i === index) {
      return { ...c, ...contactField };
    }
    return c;
  });
};

export const removeContactByIdx = (contacts: User[], index: number) => {
  return contacts.filter((c: User, i: number) => {
    return i !== index;
  });
};
