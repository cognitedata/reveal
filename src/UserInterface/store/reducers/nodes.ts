import
{
  generateRoot,
  generatePointNodes,
  generatePolylinesNodes,
  generateSubsurfaceNodes,
  generateWellNodes
} from "../../data/generateNodes";
import { FETCH_DOMAIN_NODES } from "../types/nodes";

const initialState = {
  root: generateRoot(),
  data: {},
  fetching: true
};


export default (state = initialState, action) =>
{
  switch (action.type)
  {
    case FETCH_DOMAIN_NODES:
      {
        let data = {
          ...generatePointNodes(),
          ...generatePolylinesNodes(),
          ...generateSubsurfaceNodes(),
          ...generateWellNodes()
        };
        return { ...state, data, fetching: false };
      }
    default:
      return state;
  }
};

