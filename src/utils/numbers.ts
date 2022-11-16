export const formatNumber = new Intl.NumberFormat().format;

export const isNumber = (value: Number) => !Number.isNaN(value);
