export const formatMethod = (method: string) => {
  const methodName = method.split('@')[0];

  let formattedMethodName = methodName.replace(/_/g, ' ');
  formattedMethodName =
    formattedMethodName.charAt(0).toUpperCase() + formattedMethodName.slice(1);

  return formattedMethodName;
};
