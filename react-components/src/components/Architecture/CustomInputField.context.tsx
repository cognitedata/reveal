import {
  Button,
  Input,
  Textarea,
  Comment,
  type InputProps,
  type ButtonProps,
  type TextareaProps,
  type CommentProps
} from '@cognite/cogs.js';
import { createContext, type ReactElement } from 'react';

export type CustomInputFieldDependencies = {
  Input: (props: InputProps) => ReactElement;
  Button: (props: ButtonProps) => ReactElement;
  Textarea: (props: TextareaProps) => ReactElement;
  Comment: (props: CommentProps) => ReactElement;
};

export const defaultCustomInputFieldDependencies: CustomInputFieldDependencies = {
  Input: (props) => <Input {...props} />,
  Button: (props) => <Button {...props} />,
  Textarea: (props) => <Textarea {...props} />,
  Comment: (props) => <Comment {...props} />
};

export const CustomInputFieldContext = createContext(defaultCustomInputFieldDependencies);
