import {
    IWell, ITrajectory, ITrajectoryRows, IRiskEvent, ILog, ICasing, ITrajectoryColumnIndices,
    WellId, WellBoreId, TrajectoryId, IWellBore
} from "@cognite/subsurface-interfaces";
import { Util } from "@/Core/Primitives/Util";
// Represent BP data
export default class BPData
{
    private _wellMap = new Map<WellId, IWell>();
    private _trajectoryMap = new Map<TrajectoryId, ITrajectory>();
    private _trajectoryDataMap = new Map<TrajectoryId, ITrajectoryRows>();
    private _wellBoreToWellMap = new Map<WellBoreId, { wellId: WellId, data: IWellBore }>();
    private _wellBoreToNDSEventsMap = new Map<WellBoreId, IRiskEvent[]>();
    private _wellBoreToNPTEventsMap = new Map<WellBoreId, IRiskEvent[]>();
    private _wellBoreToLogsMap?: { [key: number]: ILog[] };
    private _trajectoryDataColumnIndexes: ITrajectoryColumnIndices = {};
    private _wellBoreToCasingDataMap = new Map<WellBoreId, ICasing[]>();

    // Pass BP data coming from the BP application
    constructor(
        wells: IWell[],
        wellBores: IWellBore[],
        trajectories: ITrajectory[],
        trajectoryData?: ITrajectoryRows[],
        ndsEvents?: IRiskEvent[],
        nptEvents?: IRiskEvent[],
        logs?: { [key: number]: ILog[] },
        casing?: ICasing[])
    {
        this.generateWellMap(wells);
        this.generateBoreToWellMap(wellBores);
        this.generateTrajectoryMap(trajectories);
        this.generateTrajectoryDataColumnIndexes(trajectoryData);
        this.generateTrajectoryDataMap(trajectoryData);
        this.generateWellBoreRiskEventMap(this.wellBoreToNDSEventsMap, ndsEvents);
        this.generateWellBoreRiskEventMap(this.wellBoreToNPTEventsMap, nptEvents);
        this._wellBoreToLogsMap = logs;
        this.generateWellBoreToCasingDataMap(casing);
    }

    //==================================================
    // INSTANCE METHODS
    //==================================================
    private generateWellMap(wells: IWell[])
    {
        for (const well of wells)
        {
            const valid = this.validateWell(well);
            if (valid)
            {
                this.wellMap.set(well.id, well);
            }
        }
    }

    private generateBoreToWellMap(wellBores: IWellBore[])
    {
        for (const wellBore of wellBores)
        {
            const valid = this.validateWellBore(wellBore);
            if (valid)
            {
                this._wellBoreToWellMap.set(wellBore.id, { wellId: wellBore.parentId, data: wellBore });
            }
        }
    }

    private generateTrajectoryMap(trajectories: ITrajectory[])
    {
        if (!trajectories || !trajectories.length)
        {
            // tslint:disable-next-line:no-console
            console.warn("trajectories are empty!");
            return;
        }
        for (const trajectory of trajectories)
        {
            const valid = this.validateTrajectory(trajectory);
            if (valid)
                this.trajectoryMap.set(trajectory.id, trajectory);
        }
    }

    private generateTrajectoryDataColumnIndexes(trajectoryData?: ITrajectoryRows[])
    {
        if (!trajectoryData || !trajectoryData.length)
        {
            // tslint:disable-next-line:no-console
            console.warn("Trajectory Data are empty, Cannot create Column Indexes!");
            return;
        }
        const columnIndexes = this.trajectoryDataColumnIndexes;
        const columns = trajectoryData[0].columns;
        if (!columns || !columns.length)
        {
            // tslint:disable-next-line:no-console
            console.warn("First trajectory data item does not contain columns", trajectoryData);
            return;
        }
        for (let index = 0; index < columns.length; index++)
        {
            const columnName = columns[index].name;
            columnIndexes[columnName] = index;
        }
    }

    private generateTrajectoryDataMap(trajectoryData?: ITrajectoryRows[])
    {
        if (!trajectoryData || !trajectoryData.length)
        {
            // tslint:disable-next-line:no-console
            console.warn("Trajectory Data are empty");
            return;
        }
        for (const data of trajectoryData)
        {
            const valid = this.validateTrajectoryData(data);
            if (valid)
            {
                this._trajectoryDataMap.set(data.id, data);
            }
        }
    }

    private generateWellBoreRiskEventMap(riskEventMap: Map<number, IRiskEvent[]>, riskEvents?: IRiskEvent[])
    {
        if (!riskEvents || !riskEvents.length)
            return;
        for (const event of riskEvents)
        {
            const wellBoreIds = event.assetIds;
            const valid = this.validateRiskEvent(event, wellBoreIds);
            if (valid)
            {
                for (const wellBoreId of wellBoreIds)
                {
                    if (this.wellBoreToWellMap.has(wellBoreId))
                    {
                        if (!riskEventMap.get(wellBoreId))
                            riskEventMap.set(wellBoreId, []);
                        riskEventMap.get(wellBoreId)!.push(event);
                    }
                }
            }
        }
    }

    private generateWellBoreToCasingDataMap(casings?: ICasing[])
    {
        if (!casings || !casings.length)
        {
            // tslint:disable-next-line:no-console
            console.warn("casings are empty!");
            return;
        }
        for (const casing of casings)
        {
            const boreId = casing.assetId;
            const valid = this.validateCasing(casing);
            if (valid)
            {
                if (!this.wellBoreToCasingDataMap.get(boreId))
                {
                    this.wellBoreToCasingDataMap.set(boreId, []);
                }
                this.wellBoreToCasingDataMap.get(boreId)?.push(casing);
            }
        }
    }

    //==================================================
    // PRIVATE METHODS: Validators
    //==================================================
    private validateWell(well: IWell): boolean
    {
        //  wells with no coordinates are invalid
        const coords = well.metadata;
        const xCoord = Util.getNumber(coords.x_coordinate);
        const yCoord = Util.getNumber(coords.y_coordinate);
        if (!Number.isNaN(xCoord) && !Number.isNaN(yCoord))
        {
            return true;
        }
        else
        {
            // tslint:disable-next-line:no-console
            console.error("Well cannot have empty or invalid coordinates!", well);
            return false;
        }
    }

    private validateWellBore(wellBore: IWellBore): boolean
    {
        if (this.wellMap.has(wellBore.parentId))
        {
            return true;
        }
        else
        {
            // tslint:disable-next-line:no-console
            console.warn("Orphan WellBore, Parent Well not found!", wellBore);
            return false;
        }
    }

    private validateTrajectory(trajectory: ITrajectory): boolean
    {
        const wellBoreId = trajectory.assetId;
        if (this.wellBoreToWellMap.has(wellBoreId))
        {
            return true;
        }
        else
        {
            // tslint:disable-next-line:no-console
            console.warn("Orphan Trajectory, Parent Well Bore not found!", trajectory);
            return false;
        }
    }

    private validateTrajectoryData(trajectoryData: ITrajectoryRows): boolean
    {
        if (!trajectoryData.rows || !trajectoryData.rows.length)
        {
            // tslint:disable-next-line:no-console
            console.warn("Trajectory Data Rows are empty", trajectoryData);
            return false;
        }
        if (this.trajectoryMap.has(trajectoryData.id))
        {
            return true;
        }
        else
        {
            // tslint:disable-next-line:no-console
            console.warn("Orphan Trajectory Data Item, Parent Trajectory not found!", trajectoryData);
            return false;
        }
    }

    private validateRiskEvent(event: IRiskEvent, wellBoreIds: any[]): boolean
    {
        if (!wellBoreIds || !wellBoreIds.length)
        {
            // tslint:disable-next-line:no-console
            console.warn("Risk Event Bore Id not found, AssetIds are empty!", event);
            return false;
        }
        if (wellBoreIds.some(wellBoreId => this.wellBoreToWellMap.has(wellBoreId)))
        {
            return true;
        }
        else
        {
            // tslint:disable-next-line:no-console
            console.warn("Orphan Risk Event, Parent Bore not found!", event);
            return false;
        }
    }

    private validateCasing(casing: ICasing): boolean
    {
        const wellBoreId = casing.assetId;
        if (this.wellBoreToWellMap.has(wellBoreId))
        {
            return true;
        }
        else
        {
            // tslint:disable-next-line:no-console
            console.warn("Orphan Casing, Parent Well Bore not found!", casing);
            return false;
        }
    }

    //==================================================
    // Properties
    //==================================================
    public get wellMap() { return this._wellMap; }

    public get wellBoreToWellMap() { return this._wellBoreToWellMap; }

    public get trajectoryMap() { return this._trajectoryMap; }

    public get trajectoryDataColumnIndexes() { return this._trajectoryDataColumnIndexes; };

    public get trajectoryDataMap() { return this._trajectoryDataMap; }

    public get wellBoreToNDSEventsMap() { return this._wellBoreToNDSEventsMap; }

    public get wellBoreToNPTEventsMap() { return this._wellBoreToNPTEventsMap; };

    public get wellBoreToLogsMap() { return this._wellBoreToLogsMap; };

    public get wellBoreToCasingDataMap(): Map<number, ICasing[]> { return this._wellBoreToCasingDataMap; }
}
