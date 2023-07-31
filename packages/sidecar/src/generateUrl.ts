export const generateUrl = (
  base: string,
  prod: boolean,
  cluster: string,
  local?: false | string
) => {
  if (local) {
    return `http://localhost:${local}`;
  }

  return [
    base,
    !prod && 'staging.',
    cluster !== 'ew1' && `${cluster}.`,
    'cognite.ai',
  ]
    .filter(Boolean)
    .join('');
};
