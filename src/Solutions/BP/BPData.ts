import { Well, Wellbore, Trajectory, TrajectoryRows } from "@/Interface";

// Represent BP data
export default class BPData {

    private _wells: Well[];
    private _wellBores: Wellbore[];
    private _trajectories: Trajectory[];
    private _trajectoryData?: TrajectoryRows[];

    constructor(wells: Well[], wellBores: Wellbore[], trajectories: Trajectory[], trajectoryData?: TrajectoryRows[]) {
        this._wells = wells;
        this._wellBores = wellBores;
        this._trajectories = trajectories;
        this._trajectoryData = trajectoryData;
    }

    //==================================================
    // INSTANCE METHODS
    //==================================================

    public get wellBoreToWellMap() {
        const wellBoreToWellMap = new Map<number, { wellId: number, data: Wellbore }>();
        for (const wellBore of this._wellBores) {
            wellBoreToWellMap.set(wellBore.id, { wellId: wellBore.parentId, data: wellBore });
        }
        return wellBoreToWellMap;
    }

    public get trajectoryDataMap() {
        const trajectoryData = this._trajectoryData;
        if (!trajectoryData) {
            return null;
        }
        const trajectoryDataMap = new Map<number, TrajectoryRows>();
        for (const row of trajectoryData) {
            trajectoryDataMap.set(row.id, row)
        }
        return trajectoryDataMap;
    }

    public get wells() { return this._wells };
    public get trajectories() { return this._trajectories };
}
