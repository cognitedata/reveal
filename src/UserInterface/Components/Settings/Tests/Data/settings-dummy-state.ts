import {IconTypes} from "@/UserInterface/Components/Icon/IconTypes";

// Dummy Settings State
export const settingsDummyState = {
  id: "435nj43kn5i",
  titleBar: {
    name: "Well 7",
    icon: { type: IconTypes.NODES, name: "WellNode" },
    toolBar: [
      {
        icon: { type: IconTypes.STATES, name: "Pinned" }
      },
      {
        icon: { type: IconTypes.ARROWS, name: "FatLeft" }
      },
      {
        icon: { type: IconTypes.ARROWS, name: "FatRight" }
      }
    ]
  },
  sections: {
    "1": {
      name: "General Info",
      isExpanded: true,
      elementIds: ["1", "2", "3", "4", "5"]
    },
    "2": {
      name: "Statistics",
      isExpanded: false,
      elementIds: ["6", "7", "8", "9"]
    },
    "3": {
      name: "Visual Settings",
      isExpanded: true,
      elementIds: ["10"],
      subSectionIds: ["1", "2", "3"],
      toolBar: [
        {
          icon: { type: IconTypes.ACTIONS, name: "Paste" }
        },
        {
          icon: { type: IconTypes.ACTIONS, name: "Reset" }
        },
        {
          icon: { type: IconTypes.ACTIONS, name: "Solution" }
        },
        {
          icon: {
            type: IconTypes.NODES,
            name: "MapIcon"
          },
          selected: true,
          action: {
            type: "EXPAND",
            subSectionId: "1"
          }
        },
        {
          icon: {
            type: IconTypes.NODES,
            name: "PointCloudNode"
          },
          selected: false,
          action: {
            type: "EXPAND",
            subSectionId: "2"
          }
        },
        {
          icon: {
            type: IconTypes.NODES,
            name: "PolylinesNode"
          },
          selected: true,
          action: {
            type: "EXPAND",
            subSectionId: "3"
          }
        }
      ]
    }
  },
  subSections: {
    "1": {
      name: "Solid",
      isExpanded: true,
      iconIndex: 3,
      elementIds: ["11", "12", "13", "14", "15", "16", "17"]
    },
    "2": {
      name: "Lines",
      isExpanded: false,
      iconIndex: 4,
      elementIds: ["18", "19", "20", "21"]
    },
    "3": {
      name: "Points",
      iconIndex: 5,
      isExpanded: true,
      elementIds: ["22", "23", "24", "25", "26"]
    }
  },
  elements: {
    "1": {
      label: "Name",
      type: "text",
      value: "Random Polylines 5"
    },
    "2": {
      label: "Color",
      type: "color-table",
      value: "#FF0000"
    },
    "3": {
      label: "Type name",
      type: "text",
      value: "Polylines",
      isReadOnly: true
    },
    "4": {
      label: "Data type",
      type: "text",
      value: "Continuous",
      isReadOnly: true
    },
    "5": {
      label: "Unique id",
      type: "text",
      value: "459ff014-c0aa-4267-8e77-02e0d917c67e",
      isReadOnly: true
    },
    "6": {
      isReadOnly: true,
      label: "X(Min/Max/Delta)",
      type: "input-group",
      subElementIds: ["1", "2", "3"]
    },
    "7": {
      isReadOnly: true,
      label: "Y(Min/Max/Delta)",
      type: "input-group",
      subElementIds: ["4", "5", "6"]
    },
    "8": {
      isReadOnly: true,
      label: "Z(Min/Max/Delta)",
      type: "input-group",
      subElementIds: ["7", "8", "9"]
    },
    "9": {
      isReadOnly: true,
      label: "Number of Polylines/Points",
      type: "input-group",
      subElementIds: ["10", "11"]
    },
    "10": {
      label: "Inc",
      type: "text",
      value: "5"
    },
    "11": {
      isReadOnly: false,
      label: "Color type",
      type: "select",
      value: 0,
      options: [
        {
          name: "Node",
          icon: {
            type: IconTypes.NODES,
            name: "PointCloudNode"
          }
        },
        {
          name: "Z values",
          icon: { type: IconTypes.NODES, name: "MapIcon" }
        },
        {
          name: "Folder",
          icon: { type: IconTypes.NODES, name: "FolderNode" }
        }
      ]
    },
    "12": {
      isReadOnly: true,
      label: "Contour Type",
      type: "select",
      value: 1,
      options: [{ name: "Line" }, { name: "Continuous" }]
    },
    "13": {
      isReadOnly: false,
      label: "Bump Map",
      type: "select",
      value: 3,
      checked: false,
      options: [{ name: "Noise" }, { name: "Line" }, { name: "Solid" }, { name: "Know" }]
    },
    "14": {
      isReadOnly: false,
      label: "Transparency",
      checked: false,
      type: "range",
      value: 95
    },
    "15": {
      isReadOnly: false,
      label: "Shadow",
      checked: false,
      type: "range",
      value: 45
    },
    "16": {
      isReadOnly: false,
      label: "Specular",
      checked: false,
      type: "range",
      value: 50
    },
    "17": {
      isReadOnly: false,
      label: "Specular Size",
      checked: false,
      type: "range",
      value: 67
    },
    "18": {
      isReadOnly: false,
      label: "Color type",
      type: "select",
      value: 0,
      options: [
        {
          name: "Node",
          icon: {
            type: IconTypes.NODES,
            name: "PointCloudNode"
          }
        },
        {
          name: "Z values",
          icon: { type: IconTypes.NODES, name: "MapIcon" }
        },
        {
          name: "Folder",
          icon: { type: IconTypes.NODES, name: "FolderNode" }
        }
      ]
    },
    "19": {
      isReadOnly: true,
      label: "Pipe",
      type: "select",
      value: 1,
      options: [{ name: "1" }, { name: "2" }, { name: "3" }, { name: "4" }]
    },
    "20": {
      isReadOnly: false,
      label: "Line width",
      type: "select",
      value: 3,
      options: [{ name: "1" }, { name: "2" }, { name: "3" }, { name: "4" }]
    },
    "21": {
      label: "Line symbol",
      type: "select",
      value: 1,
      options: [{ name: "Solid" }, { name: "Dash" }, { name: "Dot" }]
    },
    "22": {
      isReadOnly: false,
      label: "Color type",
      type: "select",
      value: 2,
      options: [
        {
          name: "Node",
          icon: {
            type: IconTypes.NODES,
            name: "PointCloudNode"
          }
        },
        {
          name: "Z values",
          icon: { type: IconTypes.NODES, name: "MapIcon" }
        },
        {
          name: "Folder",
          icon: { type: IconTypes.NODES, name: "FolderNode" }
        }
      ]
    },
    "23": {
      isReadOnly: true,
      label: "Radius",
      type: "select",
      value: 1,
      options: [{ name: "1" }, { name: "2" }, { name: "3" }, { name: "4" }]
    },
    "24": {
      isReadOnly: false,
      label: "Symbol",
      type: "select",
      value: 0,
      options: [
        {
          name: "Sphere",
          icon: { type: IconTypes.POINT_SYMBOL, name: "Sphere" }
        },
        {
          name: "Cube",
          icon: { type: IconTypes.POINT_SYMBOL, name: "Cube" }
        }
      ]
    },
    "25": {
      isReadOnly: false,
      label: "Filter",
      type: "input-group",
      checked: false,
      subElementIds: ["12", "13"]
    },
    "26": {
      isReadOnly: false,
      label: "Transparency",
      checked: false,
      type: "range",
      value: 95
    }
  },
  subElements: {
    "1": {
      type: "text",
      value: 8102.53,
      isReadOnly: true
    },
    "2": {
      type: "text",
      value: 8102.53,
      isReadOnly: true
    },
    "3": {
      type: "text",
      value: 5924.44,
      isReadOnly: true
    },
    "4": {
      type: "text",
      value: -2092.65,
      isReadOnly: true
    },
    "5": {
      type: "text",
      value: -723.08,
      isReadOnly: true
    },
    "6": {
      type: "text",
      value: 1369.57,
      isReadOnly: true
    },
    "7": {
      type: "text",
      value: -2092.65,
      isReadOnly: true
    },
    "8": {
      type: "text",
      value: -723.08,
      isReadOnly: true
    },
    "9": {
      type: "text",
      value: 1369.57,
      isReadOnly: true
    },
    "10": {
      type: "text",
      value: 10,
      isReadOnly: true
    },
    "11": {
      type: "text",
      value: 7140,
      isReadOnly: true
    },
    "12": {
      type: "select",
      value: 0,
      options: [{ name: "Decimate" }, { name: "Every Nth" }, { name: "First" }, { name: "Last" }]
    },
    "13": {
      type: "select",
      value: 0,
      options: [{ name: 2 }]
    }
  }
};
