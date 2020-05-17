import { v4 as uuidv4 } from "uuid";
import { IconTypes } from "../constants/Icons";

export const state2 = {
  section1: {
    name: "Galaxy",
    icon: { type: IconTypes.NODES, name: "PointsNode" },
    toolBar: [
      {
        icon: { type: IconTypes.STATES, name: "Pinned" },
      },
      {
        icon: { type: IconTypes.ARROWS, name: "FatLeft" },
      },
      {
        icon: { type: IconTypes.ARROWS, name: "FatRight" },
      },
    ],
    subSections: [
      {
        name: "General Info",
        isExpanded: true,
        elements: [
          {
            label: "Name",
            type: "input",
            value: "Galaxy",
          },
          {
            label: "Color",
            type: "color-table",
            value: "#00ff00",
          },
          {
            label: "Type name",
            type: "input",
            value: "Point Cloud",
            isReadOnly: true,
          },
          {
            label: "Data type",
            type: "input",
            value: "Continuous",
            isReadOnly: true,
          },
          {
            label: "Unique id",
            type: "input",
            value: "459ff014-c0aa-4267-8e77-02e0d917c67e",
            isReadOnly: true,
          },
        ],
      },
      {
        name: "Statistics",
        isExpanded: false,
        elements: [
          {
            isReadOnly: true,
            label: "X(Min/Max/Delta)",
            type: "input-group",
            subElements: [
              {
                type: "input",
                value: 8102.53,
                isReadOnly: true,
              },
              {
                type: "input",
                value: 8102.53,
                isReadOnly: true,
              },
              {
                type: "input",
                value: 5924.44,
                isReadOnly: true,
              },
            ],
          },
          {
            isReadOnly: true,
            label: "Y(Min/Max/Delta)",
            type: "input-group",
            subElements: [
              {
                type: "input",
                value: 5717.63,
                isReadOnly: true,
              },
              {
                type: "input",
                value: 8109.4,
                isReadOnly: true,
              },
              {
                type: "input",
                value: 2391.77,
                isReadOnly: true,
              },
            ],
          },
          {
            isReadOnly: true,
            label: "Z(Min/Max/Delta)",
            type: "input-group",
            subElements: [
              {
                type: "input",
                value: -2092.65,
                isReadOnly: true,
              },
              {
                type: "input",
                value: -723.08,
                isReadOnly: true,
              },
              {
                type: "input",
                value: 1369.57,
                isReadOnly: true,
              },
            ],
          },
          {
            isReadOnly: true,
            label: "Number of Polylines/Points",
            type: "input-group",
            subElements: [
              {
                type: "input",
                value: 10,
                isReadOnly: true,
              },
              {
                type: "input",
                value: 7140,
                isReadOnly: true,
              },
            ],
          },
        ],
      },
    ],
  },
  section2: {
    name: "Visual Settings",
    toolBar: [
      {
        icon: { type: IconTypes.ACTIONS, name: "Paste" },
      },
      {
        icon: { type: IconTypes.ACTIONS, name: "Reset" },
      },
      {
        icon: { type: IconTypes.ACTIONS, name: "Solution" },
      },
      {
        icon: { type: IconTypes.NODES, name: "PointCloudNode", selected: true },
        action: {
          type: "EXPAND",
          subSectionIndex: 0,
        },
      },
      {
        icon: { type: IconTypes.SHOW, name: "Label", selected: false },
        action: {
          type: "EXPAND",
          subSectionIndex: 1,
        },
      },
    ],
    subSections: [
      {
        name: "Points",
        iconIndex: 3,
        isExpanded: true,
        elements: [
          {
            isReadOnly: false,
            label: "Color type",
            type: "select",
            value: 2,
            options: [
              {
                name: "Node",
                icon: {
                  type: IconTypes.NODES,
                  name: "PointCloudNode",
                },
              },
              {
                name: "Z values",
                icon: { type: IconTypes.NODES, name: "Map" },
              },
              {
                name: "Folder",
                icon: { type: IconTypes.NODES, name: "FolderNode" },
              },
            ],
          },
          {
            isReadOnly: true,
            label: "Radius",
            type: "select",
            value: 1,
            options: [
              { name: "1" },
              { name: "2" },
              { name: "3" },
              { name: "4" },
            ],
          },
          {
            isReadOnly: false,
            label: "Symbol",
            type: "select",
            value: 0,
            options: [
              {
                name: "Sphere",
                icon: { type: IconTypes.POINT_SYMBOL, name: "Sphere" },
              },
              {
                name: "Cube",
                icon: { type: IconTypes.POINT_SYMBOL, name: "Cube" },
              },
            ],
          },
          {
            isReadOnly: false,
            label: "Filter",
            type: "input-group",
            subElements: [
              {
                type: "select",
                value: 0,
                options: [
                  { name: "Decimate" },
                  { name: "Every Nth" },
                  { name: "First" },
                  { name: "Last" },
                ],
              },
              {
                type: "select",
                value: 0,
                options: [{ name: 2 }],
              },
            ],
          },
          {
            isReadOnly: false,
            label: "Transparency",
            type: "range",
            value: 95,
          },
        ],
      },
      {
        name: "Labels",
        iconIndex: 4,
        isExpanded: false,
        elements: [
          {
            isReadOnly: false,
            label: "Color type",
            type: "select",
            value: 0,
            options: [
              {
                name: "Node",
                icon: {
                  type: IconTypes.NODES,
                  name: "PointCloudNode",
                },
              },
              {
                name: "Z values",
                icon: { type: IconTypes.NODES, name: "Map" },
              },
              {
                name: "Folder",
                icon: { type: IconTypes.NODES, name: "FolderNode" },
              },
            ],
          },
          {
            label: "Font",
            type: "input-group",
            subElements: [
              {
                type: "image-button",
                isSelected: false,
                icon: { type: IconTypes.ACTIONS, name: "FontBold" },
              },
              {
                type: "image-button",
                isSelected: false,
                icon: { type: IconTypes.ACTIONS, name: "FontItalic" },
              },
              {
                type: "image-button",
                isSelected: false,
                icon: { type: IconTypes.ACTIONS, name: "FontUnderline" },
              },
              {
                type: "select",
                value: 0,
                options: [
                  { name: "6" },
                  { name: "7" },
                  { name: "8" },
                  { name: "9" },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  section3: {
    name: "New random Wells",
    icon: { type: IconTypes.NODES, name: "PolylinesNode" },
    toolBar: [
      {
        icon: { type: IconTypes.STATES, name: "Pinned" },
      },
      {
        icon: { type: IconTypes.ARROWS, name: "FatLeft" },
      },
      {
        icon: { type: IconTypes.ARROWS, name: "FatRight" },
      },
    ],
    subSections: [
      {
        name: "General Info",
        isExpanded: true,
        elements: [],
      },
    ],
  },
};
