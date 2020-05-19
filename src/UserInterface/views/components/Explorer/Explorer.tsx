import React, { useState } from "react";
import VirtualTree from "./VirtualTree";
import PointCloudNode from "../../../assets/images/Icons/Nodes/PointCloudNode.png";
import PolylinesNode from "../../../assets/images/Icons/Nodes/PolylinesNode.png";
import SurfaceNode from "../../../assets/images/Icons/Nodes/SurfaceNode.png";

const RANDOM_WORDS = [
  "abstrusity",
  "advertisable",
  "bellwood",
  "benzole",
  "boreum",
  "brenda",
  "cassiopeian",
  "chansonnier",
  "cleric",
  "conclusional",
  "conventicle",
  "copalm",
  "cornopion"
];

export function Explorer() {
  const [icon, setIcon] = useState("points");
  const [checkType, setCheckType] = useState("normal");
  const [checkState, setCheckState] = useState("normal");

  const handleIconChange = (event: any) => {
    setIcon(event.target.value);
  };
  const handleCheckTypeChange = (event: any) => {
    setCheckType(event.target.value);
  };
  const handleCheckStateChange = (event: any) => {
    setCheckState(event.target.value);
  };

  let iconImage = PointCloudNode;

  if (icon === "lines") {
    iconImage = PolylinesNode;
  } else if (icon === "surface") {
    iconImage = SurfaceNode;
  }

  const createRandomizedItem = (depth: number) => {
    const item: any = {
      id: "",
      expanded: false,
      children: [],
      name: "",
      icon: iconImage,
      iconDescription: "node",
      selected: false,
      checked: false,
      indeterminate: false,
      isFilter: checkType === "filter" ? true : false,
      isRadio: false,
      disabled: checkState === "disabled" ? true : false,
      visible: true
    };
    item.name = RANDOM_WORDS[Math.floor(Math.random() * RANDOM_WORDS.length)];
    item.id = item.name;

    var numChildren = depth < 3 ? Math.floor(Math.random() * 5) : 0;
    for (var i = 0; i < numChildren; i++) {
      item.children.push(createRandomizedItem(depth + 1));
    }

    item.expanded = numChildren > 0 && Math.random() < 0.25;

    return item;
  };

  const createRandomizedData = () => {
    var data = [];

    for (var i = 0; i < 100; i++) {
      data.push(createRandomizedItem(0));
    }

    return data;
  };

  const data = createRandomizedData();

  return (
    <div className="explorer explorer-container">
      <VirtualTree data={data} />
    </div>
  );
}
