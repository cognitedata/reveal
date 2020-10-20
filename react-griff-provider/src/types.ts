export interface AxisDomains {
  time: Domain;
  x: Domain;
  y: Domain;
}

export interface AxisDomainsByItemId {
  [itemId: string]: AxisDomains;
}

export type Domain = [number, number] & { placeholder?: boolean };

export type ItemId = string | number;

export type LoaderParams = {
  pointsPerSeries: number | undefined;
  reason: string;
  timeDomain: Domain;
  id: string | number;
  timeSubDomain: Domain;
  oldSeries: Series;
};

export type Domains = {
  timeDomain?: Domain;
  timeSubDomain?: Domain;
  xDomain?: Domain;
  xSubDomain?: Domain;
  yDomain?: Domain;
  ySubDomain?: Domain;
};

export type CollectionsWithDomains = {
  [k: string]: Domains;
};

export interface Series extends Item {
  loader?: (params: LoaderParams) => Promise<Series>;
  collectionId?: ItemId;
}

export type Collection = Item;

export interface Datapoint {
  timestamp?: number;
  x?: number;
  y?: number;
  value?: number;
}

export type AccessorFunction = (
  d: Datapoint,
  i?: number,
  arr?: ArrayLike<Datapoint>
) => number;

export interface Item {
  id: ItemId;
  data: Datapoint[];
  color?: string;
  hidden?: boolean;
  drawPoints?: boolean;
  timeAccessor: AccessorFunction;
  xAccessor: AccessorFunction;
  x0Accessor?: AccessorFunction;
  x1Accessor?: AccessorFunction;
  yAccessor: AccessorFunction;
  y0Accessor?: AccessorFunction;
  y1Accessor?: AccessorFunction;
  timeDomain?: Domain;
  timeSubDomain?: Domain;
  xDomain?: Domain;
  xSubDomain?: Domain;
  yDomain?: Domain;
  ySubDomain?: Domain;
  pointWidth?: number;
}

export interface AxisPlacement {
  id: number;
  name: string;
  toString: () => string;
}

export type UpdateState<T> = (
  state: ((prevState: Readonly<T>) => Pick<T, keyof T>) | Pick<T, keyof T>,
  callback?: () => void
) => void;
