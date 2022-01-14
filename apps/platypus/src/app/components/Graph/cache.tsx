import LRU from 'lru-cache';
import { Node } from './Graph';

export const locationCache = new LRU<string, string>({
  maxAge: Infinity,
  max: 50, // arbitrary cache size
});

const LOCAL_STORAGE_CACHE = `VISUALIZER_LOCAL_STORAGE_CACHE`;
locationCache.load(
  JSON.parse(localStorage.getItem(LOCAL_STORAGE_CACHE) || '{}')
);

type TempLocationCache = {
  [id: string]: {
    fx: number;
    fy: number;
  };
};

const getNodesKey = (nodes: Node[]) =>
  nodes
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((node) => node.id)
    .join('-');

const stringfyLocation = (nodes: Node[]) =>
  JSON.stringify(
    nodes
      .filter((node) => node.fx !== undefined && node.fy !== undefined)
      .reduce(
        (prev, node) => ({
          ...prev,
          [node.id]: {
            fx: node.fx!,
            fy: node.fy!,
          },
        }),
        {} as TempLocationCache
      )
  );
const parseLocation = (cacheString: string) =>
  JSON.parse(cacheString) as TempLocationCache;

export const saveToCache = (
  nodes: Node[],
  id: string,
  x: number,
  y: number
) => {
  locationCache.set(
    getNodesKey(nodes),
    stringfyLocation(
      nodes.map((el) => {
        if (el.id === id) {
          return {
            ...el,
            fx: x,
            fy: y,
          };
        }
        return el;
      })
    )
  );
  localStorage.setItem(
    LOCAL_STORAGE_CACHE,
    JSON.stringify(locationCache.dump())
  );
};

export const loadFromCache = (nodes: Node[]) =>
  parseLocation(locationCache.get(getNodesKey(nodes)) || '{}');
