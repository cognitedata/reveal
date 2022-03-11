import { prompt } from 'enquirer';
export type Req<T> = {
  name: keyof T;
  message: string;
  type: 'autocomplete' | 'input' | 'confirm';
  required: boolean;
  choices?: Array<unknown> | (() => Array<unknown>);
  validate?: (
    value: string
  ) => boolean | Promise<boolean> | string | Promise<string>;
  [extra: string]: unknown;
};

export const askUserForInputIfNeeded = async <T>(
  args: T,
  required: Req<T>[]
) => {
  const options = required.filter(
    (req) => args[req.name] === undefined || args[req.name] === null
  );
  if (options.length > 0) {
    return prompt(options as never) as unknown as { [K in keyof T]: T[K] };
  } else {
    // if nothing needs to be prompted, return the original set of args
    return args;
  }
};
