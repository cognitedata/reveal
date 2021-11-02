export const sanitizeValue = (value: string) =>
  /** Replace all characters except for alphanumeric characters, dashes and periods with underscores */
  value.replace(/[^-.\w]+/g, '_').replace('/', '_');
