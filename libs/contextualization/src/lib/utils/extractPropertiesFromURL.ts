export const extractPropertiesFromURL = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const type = searchParams.get('type') || '';

  return { type };
};
