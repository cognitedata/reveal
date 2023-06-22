import { PostProcessorModule } from 'i18next';

export const lowercasePostProcessor: PostProcessorModule = {
  type: 'postProcessor',
  name: 'lowercase',
  process: function (value, _, __, translator) {
    const language =
      typeof translator?.language === 'string'
        ? (translator?.language as string)
        : undefined;

    if (typeof value !== 'string' || !language) {
      return value;
    }

    return value.toLocaleLowerCase(language);
  },
};

export const uppercasePostProcessor: PostProcessorModule = {
  type: 'postProcessor',
  name: 'uppercase',
  process: function (value, _, __, translator) {
    const language =
      typeof translator?.language === 'string'
        ? (translator?.language as string)
        : undefined;

    if (typeof value !== 'string' || !language) {
      return value;
    }

    return value.toLocaleUpperCase(language);
  },
};
