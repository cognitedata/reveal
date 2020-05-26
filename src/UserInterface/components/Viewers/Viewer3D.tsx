import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import RootManager from "@/UserInterface/managers/rootManager";
import { ReduxStore } from "@/UserInterface/interfaces/common";

// 3D Viewer
export default function Viewer3D() {

    const root = useSelector((store: ReduxStore) => store.explorer.root);

    useEffect(() => {
        if (!RootManager.isCanvasAvailable("3d")) {
            RootManager.appendDOM(root, "viewer-3d", "3d");
        }
    });
    return <div
        id="viewer-3d"
        className="viewer-3d">
    </div>
}
