// get a value to use as an id from a possibly unsafe string
export const toId = (unsafeString: string) => {
  return unsafeString.replace(/\W/g, '');
};
