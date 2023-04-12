import { Cognite3DViewer, AnnotationIdPointCloudObjectCollection, CognitePointCloudModel } from "@cognite/reveal";
import { HtmlOverlayTool } from '@cognite/reveal/tools';
import { CogniteClient, AnnotationUpdate, AnnotationType, SetField, AnnotationData, AnnotationStatus, AnnotationChangeById } from '@cognite/sdk';
import { update } from "lodash";
import * as THREE from 'three';

function createAnnotationOverlay(text: string, overlayTool: HtmlOverlayTool, client: CogniteClient, pointCloudModel: CognitePointCloudModel) {

    // Update annotation with asset ref
    // id "id": 2459341270087784,
    const annotation_type = {} as SetField<AnnotationType>;
    annotation_type.set = "pointcloud.BoundingVolume";

    const data = {} as SetField<AnnotationData>;
    data.set = {
        region: [
            {
                "box": {
                    "matrix": [
                        1.0,
                        0.0,
                        0.0,
                        -12.75,
                        0.0,
                        1.0,
                        0.0,
                        -8.2902,
                        0.0,
                        0.0,
                        1.0,
                        -0.6588,
                        0.0,
                        0.0,
                        0.0,
                        1.0
                    ]
                }
            }
        ],
        assetRef: {
            //externalId: "blk-outdoor-child-1",
            id: 6906985595421230
        }
    };

    const status = {} as SetField<AnnotationStatus>;
    status.set = "suggested";

    const annotation_update: AnnotationUpdate = {
        update: {
            annotationType: annotation_type,
            data: data,
            status: status,

        }
    };

    const annotation_changes: AnnotationChangeById[] = [
        {
            id: 2459341270087784,
            update: annotation_update.update
        }
    ];

    const res = client.annotations.update(
        annotation_changes
    );

    console.log("The bounding volume was updated on click!", res);
    // 238, g: 25, b: 190
    const objectStyle = new THREE.Color(
        Math.floor(238),
        Math.floor(25),
        Math.floor(190),
    );
    console.log("Color style:", objectStyle);

    const stylableObject = new AnnotationIdPointCloudObjectCollection([
        2459341270087784,
    ]);
    pointCloudModel.assignStyledObjectCollection(stylableObject, {
        color: objectStyle,
    });

    const element = document.createElement('div');
    element.innerText = text;
    element.style.position = "absolute";
    element.style.transform = "translate(-50%, -50%)";
    //element.style.pointerEvents = "none";
    //element.style.touchAction = "none";
    element.style.userSelect = "none";
    element.style.paddingLeft = "40px";
    element.style.paddingRight = "40px";
    element.style.paddingTop = "40px";
    element.style.paddingBottom = "40px";
    element.style.backgroundColor = "rgba(0,255,0,0.5)";
    element.style.fontSize = "xx-large";

    element.onclick = () => {
        overlayTool.clear();
        console.log('Verification overlay removed.');
    };


    return element;


}

export function createOverlay(text: string, viewer: Cognite3DViewer, client: CogniteClient, pointCloudModel: CognitePointCloudModel) {
    const pos = [
        -14.112567663192749,
        0.5363917350769043,
        8.289570808410645
    ];
    const overlayTool = new HtmlOverlayTool(viewer);
    const positionVerifyMessage = new THREE.Vector3().fromArray(pos);
    const element = document.createElement('div');

    element.innerText = text;
    element.style.position = "absolute";
    element.style.transform = "translate(-50%, -50%)";


    element.style.userSelect = "none";
    element.style.paddingLeft = "40px";
    element.style.paddingRight = "40px";
    element.style.paddingTop = "40px";
    element.style.paddingBottom = "40px";
    element.style.backgroundColor = "rgba(255,165,0,0.5)";

    element.onclick = () => {
        overlayTool.add(createAnnotationOverlay("Asset tag '123-OFFICE' was linked to bounding volume 'PC-4455.", overlayTool, client, pointCloudModel), positionVerifyMessage);
        console.log('clicked');
    };
    return element;
}

