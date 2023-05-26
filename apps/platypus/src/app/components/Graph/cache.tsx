import LRU from 'lru-cache';

import { Node } from './GraphEngine';

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

export const getNodesKey = (nodes: Node[]) =>
  nodes
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((node) => node.id)
    .join('-');

const stringfyLocation = (nodes: Node[]) =>
  JSON.stringify(
    nodes.reduce(
      (prev, node) => ({
        ...prev,
        [node.id]: {
          fx: node.fx!,
          fy: node.fy!,
          y: node.y!,
          x: node.x!,
          vx: node.vx!,
          vy: node.vy!,
        },
      }),
      {} as TempLocationCache
    )
  );
const parseLocation = (cacheString: string) =>
  JSON.parse(cacheString) as TempLocationCache;

export const saveToCache = (key: string, nodes: Node[]) => {
  locationCache.set(
    key,
    stringfyLocation(
      nodes.map((el) => {
        return {
          id: el.id,
          title: el.title,
          fx: el.fx,
          fy: el.fy,
          x: el.x,
          y: el.y,
          vx: el.vx,
          vy: el.vy,
        };
      })
    )
  );
  localStorage.setItem(
    LOCAL_STORAGE_CACHE,
    JSON.stringify(locationCache.dump())
  );
};

export const loadFromCache = (key: string) =>
  parseLocation(locationCache.get(key) || '{}');
