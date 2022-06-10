export const formatMethod = (methodName: string) => {
  let formattedMethodName = methodName.replace(/_/g, ' ');
  formattedMethodName =
    formattedMethodName.charAt(0).toUpperCase() + formattedMethodName.slice(1);

  return formattedMethodName;
};
