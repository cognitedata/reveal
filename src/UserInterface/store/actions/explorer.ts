import {
  FETCH_DOMAIN_NODES,
  TOGGLE_NODE_VISIBILITY,
  TOGGLE_NODE_SELECTION,
} from "../types/explorer";

export const toggleNodeVisibility = (payload) => {
  return { type: TOGGLE_NODE_VISIBILITY, payload };
};

export const toggleNodeSelection = (payload) => {
  return { type: TOGGLE_NODE_SELECTION, payload };
};

export const fetchDomainNodes = () => {
  return { type: FETCH_DOMAIN_NODES };
};
