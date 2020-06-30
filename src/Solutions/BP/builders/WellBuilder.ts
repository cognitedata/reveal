import * as utm from "utm";
import { WellNode } from "@/Nodes/Wells/Wells/WellNode";
import { Vector3 } from "@/Core/Geometry/Vector3";
import { Well } from "@/Interface";

/**
 * Build WellNode from BP Data
 */
export default class WellBuilder {

    private wellNode: WellNode;
    private wellData: Well;

    // Initialize wellNode
    constructor(data: Well) {
        this.wellData = data;
        this.wellNode = new WellNode();
        this.wellNode.setName(data.name);
    }

    // Create the well head relative to the reference vector
    // The vector is generated using the first well of the well list as a reference
    setWellHead(xyWellRefV: Vector3) {
        if (this.wellData && this.wellData.metadata) {
            const metadata = this.wellData.metadata;
            const xCoordinate = parseFloat(metadata.x_coordinate);
            const yCoordinate = parseFloat(metadata.y_coordinate);
            const xyWell = utm.fromLatLon(yCoordinate, xCoordinate);
            this.wellNode.wellHead = new Vector3(xyWell.easting, xyWell.northing, parseFloat(metadata.water_depth));
            this.wellNode.wellHead.substract(xyWellRefV);
        }
        return this;
    }

    // Getter for wellNode
    public getWell(): WellNode {
        return this.wellNode;
    }
}
