import { mixerApiBuiltInTypes } from '@platypus/platypus-core';

export const getBuiltInTypesString = () => {
  return mixerApiBuiltInTypes
    .map((builtInType) => {
      if (builtInType.type === 'DIRECTIVE') {
        return builtInType.body;
      } else if (builtInType.type === 'OBJECT') {
        return `type ${builtInType.name} {}`;
      } else {
        return `scalar ${builtInType.name}`;
      }
    })
    .join('\n');
};

export const getWhiteListedEnumsAndInputs = () => {
  const builtInTypesString = getBuiltInTypesString();

  const whitelist = (
    builtInTypesString.match(/(input|enum)\s*[a-zA-Z_]+/gm) || []
  ).map((item) => item.replaceAll(/(input|enum|\s)/g, ''));

  return whitelist;
};
