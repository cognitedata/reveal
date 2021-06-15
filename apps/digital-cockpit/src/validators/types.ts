type ValidationMessage = {
  message: string;
};
type ValidationPattern = {
  message: string;
  value: string;
};
type ValidationFunction = (value: string) => string;

export type ValidationRules = {
  required?: ValidationMessage;
  pattern?: ValidationPattern;
  maxSize?: ValidationMessage;
  mimeType?: ValidationMessage;
  validate?: ValidationFunction;
};
export type Validator = {
  [key: string]: ValidationRules;
};
