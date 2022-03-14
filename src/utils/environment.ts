export const isDevelopment = process.env.NODE_ENV === 'development';
export const isStaging = process.env.REACT_APP_ENV === 'staging';
export const isPR = process.env.REACT_APP_ENV === 'preview';
export const isProduction = process.env.REACT_APP_ENV === 'production';
