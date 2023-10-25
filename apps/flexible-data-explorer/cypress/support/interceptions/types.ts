import { requestAlias } from './requestAlias';

export type RequestAlias = keyof typeof requestAlias;

export type RequestIntercept = () => void;
