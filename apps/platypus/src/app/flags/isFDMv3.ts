export const isFDMv3 = (pathName = window.location.pathname) => {
  // pathname is something like '/<project_name>/data-models-previous/'
  return pathName.split('/')[2] !== 'data-models-previous';
};
