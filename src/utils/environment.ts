const { REACT_APP_ENV = 'development', NODE_ENV } = process.env;

export const isDevelopment =
  REACT_APP_ENV === 'development' || NODE_ENV === 'development';
export const isStaging = REACT_APP_ENV === 'staging';
export const isPR = REACT_APP_ENV === 'preview';
export const isProduction = REACT_APP_ENV === 'production';
