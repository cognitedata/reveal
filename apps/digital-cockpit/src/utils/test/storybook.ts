import { Story } from '@storybook/react';

export type ExtendedStory<T> = Story<T> & { story?: any };
