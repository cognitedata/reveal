import {
  generateWellNodes,
  generateRoot,
  updateWellNodeVisibility,
} from "../../data/generateNodes";

import {
  FETCH_DOMAIN_NODES,
  TOGGLE_NODE_VISIBILITY,
  TOGGLE_NODE_SELECTION,
} from "../types/explorer";

const initialState = {
  root: generateRoot(),
  data: {},
  fetching: true,
  selectedNode: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_DOMAIN_NODES: {
      let data = generateWellNodes();
      return { ...state, data, fetching: false };
    }
    case TOGGLE_NODE_VISIBILITY: {
      const { id } = action.payload;
      const data = { ...state.data };
      const node = { ...data[id] };
      node.isVisible = !node.isVisible;
      updateWellNodeVisibility(id, node.isVisible);
      data[id] = node;
      return { ...state, data };
    }
    case TOGGLE_NODE_SELECTION: {
      const { id } = action.payload;
      const data = { ...state.data };
      const node = { ...data[id] };
      node.isSelected = !node.isSelected;
      data[id] = node;
      return { ...state, data, selectedNode: data[id] };
    }
    default:
      return state;
  }
};
