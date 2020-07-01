import { Well, Wellbore, Trajectory, TrajectoryRows, RiskEvent } from "@/Interface";

// Represent BP data
export default class BPData {

    private _wells: Well[];
    private _trajectories: Trajectory[];
    private _trajectoryDataMap = new Map<number, TrajectoryRows>();
    private _wellBoreToWellMap = new Map<number, { wellId: number, data: Wellbore }>();
    private _wellBoreToNDSEventsMap = new Map<number, RiskEvent[]>();
    private _wellBoreToNPTEventsMap = new Map<number, RiskEvent[]>();
    private _trajectoryDataColumnIndexes: { [key: string]: number } = {};


    // Pass BP data coming from the BP application
    constructor(
        wells: Well[],
        wellBores: Wellbore[],
        trajectories: Trajectory[],
        trajectoryData?: TrajectoryRows[],
        ndsEvents?: RiskEvent[],
        nptEvents?: RiskEvent[]) {
        this._wells = wells;
        this._trajectories = trajectories;
        this.generateBoreToWellMap(wellBores);
        this.generateTrajectoryDataMap(trajectoryData);
        this.generateWellBoreToNDSEventsMap(ndsEvents);
        this.generateWellBoreToNPTEventsMap(nptEvents);
        this.generateTrajectoryDataColumnIndexes(trajectoryData);
    }

    //==================================================
    // INSTANCE METHODS
    //==================================================

    private generateBoreToWellMap(wellBores: Wellbore[]) {
        for (const wellBore of wellBores) {
            this._wellBoreToWellMap.set(wellBore.id, { wellId: wellBore.parentId, data: wellBore });
        }
    }

    private generateTrajectoryDataMap(trajectoryData?: TrajectoryRows[]) {
        if (!trajectoryData) {
            return;
        }
        for (const data of trajectoryData) {
            this._trajectoryDataMap.set(data.id, data)
        }
    }

    private generateWellBoreToNDSEventsMap(ndsEvents?: RiskEvent[]) {
        if (!ndsEvents) {
            return;
        }
        const wellBoreToNDSEventsMap = this._wellBoreToNDSEventsMap;
        for (const ndsEvent of ndsEvents) {
            const assetIds = ndsEvent.assetIds;
            if (!assetIds || !assetIds.length) {
                continue;
            }
            for (const assetId of assetIds) { // Mihil : Shouldn't assetIds contain just 1 item
                if (!wellBoreToNDSEventsMap.get(assetId)) {
                    wellBoreToNDSEventsMap.set(assetId, []);
                }
                wellBoreToNDSEventsMap.get(assetId)?.push(ndsEvent);
            }
        }
        // tslint:disable-next-line: no-console
        console.log("NodeVisualizer: NDSEvents", wellBoreToNDSEventsMap);
    }

    private generateWellBoreToNPTEventsMap(nptEvents?: RiskEvent[]) {
        if (!nptEvents) {
            return;
        }
        const wellBoreToNPTEventsMap = this._wellBoreToNPTEventsMap;
        for (const nptEvent of nptEvents) {
            const assetIds = nptEvent.assetIds;
            if (!assetIds || !assetIds.length) {
                continue;
            }
            for (const assetId of assetIds) {
                if (!wellBoreToNPTEventsMap.get(assetId)) {
                    wellBoreToNPTEventsMap.set(assetId, []);
                }
                wellBoreToNPTEventsMap.get(assetId)?.push(nptEvent);
            }
        }
        // tslint:disable-next-line: no-console
        console.log("NodeVisualizer: NPTEvents", wellBoreToNPTEventsMap);
    }

    private generateTrajectoryDataColumnIndexes(trajectoryData?: TrajectoryRows[]) {
        if (!trajectoryData || !trajectoryData.length) {
            return;
        }
        const indexes: { [key: string]: number } = this._trajectoryDataColumnIndexes;
        const column = trajectoryData[0].columns;
        for (let index = 0; index < column.length; index++) {
            const columnName = column[index].name;
            indexes[columnName] = index;
        }
    }

    public get wells() { return this._wells; }
    public get trajectories() { return this._trajectories; }
    public get trajectoryDataMap() { return this._trajectoryDataMap; }
    public get wellBoreToWellMap() { return this._wellBoreToWellMap; }
    public get wellBoreToNDSEventsMap() { return this._wellBoreToNDSEventsMap; }
    public get wellBoreToNPTEventsMap() { return this._wellBoreToNPTEventsMap };
    public get trajectoryDataColumnIndexes() { return this._trajectoryDataColumnIndexes };
}
