import { createLink } from '@cognite/cdf-utilities';

export const createCdfLink = (path: string) => createLink(`/simint/${path}`);
