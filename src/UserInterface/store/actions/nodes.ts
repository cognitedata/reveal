import
{
  FETCH_DOMAIN_NODES
} from "../types/nodes";

export const fetchDomainNodes = (payload) =>
{
  return { type: FETCH_DOMAIN_NODES, payload }
};