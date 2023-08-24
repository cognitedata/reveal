export const extractPropertiesFromURL = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const type = searchParams.get('type') || '';
  const space = searchParams.get('space') || '';

  return { type, space };
};
