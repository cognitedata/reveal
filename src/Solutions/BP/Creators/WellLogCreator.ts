import { FloatLog } from "@/Nodes/Wells/Logs/FloatLog";
import { FloatLogNode } from "@/Nodes/Wells/Wells/FloatLogNode";
import { IRiskEvent, ILog, ILogRow, ILogRowColumn } from "@/Interface";
import { PointLog } from "@/Nodes/Wells/Logs/PointLog";
import { PointLogSample } from "@/Nodes/Wells/Samples/PointLogSample";
import { PointLogNode } from "@/Nodes/Wells/Wells/PointLogNode";
import { Units } from "@/Core/Primitives/Units";
import { LogFolder } from "@/Nodes/Wells/Wells/LogFolder";
import { Util } from "@/Core/Primitives/Util";
import { FloatLogSample } from "@/Nodes/Wells/Samples/FloatLogSample";
import { BaseLogNode } from "@/Nodes/Wells/Wells/BaseLogNode";
import { DiscreteLog } from "@/Nodes/Wells/Logs/DiscreteLog";
import { DiscreteLogSample } from "@/Nodes/Wells/Samples/DiscreteLogSample";
import { DiscreteLogNode } from "@/Nodes/Wells/Wells/DiscreteLogNode";
import { BaseNode } from "@/Core/Nodes/BaseNode";

export default class WellLogCreator
{
    //==================================================
    // STATIC METHODS
    //==================================================

    public static createRiskLogNode(events: IRiskEvent[] | null | undefined): PointLogNode | null
    {
        if (!events)
            return null;

        const log = WellLogCreator.createRiskLog(events);
        if (!log)
            return null;

        const node = new PointLogNode();
        node.data = log;
        return node;
    }

    public static addLogNodes(parent: BaseNode, logs: ILog[] | null): void
    {
        if (!logs)
            return;

        for (let index = 0; index < logs.length; index++)
        {
            const folder = WellLogCreator.createLogFolder(logs[index].items);
            if (folder)
                parent.addChild(folder);
        }
    }

    //==================================================
    // STATIC METHODS: Helpers
    //==================================================

    private static createLogFolder(items: ILogRow[] | null): LogFolder | null
    {
        if (items == null || items.length === 0)
            return null;

        const firstColumns = items[0].columns;
        let mdIndex: number = WellLogCreator.getMdIndex(firstColumns);
        if (mdIndex < 0)
            return null;

        let folder: LogFolder | null = null; // Lazy creation of this
        for (let logIndex = 0; logIndex < firstColumns.length; logIndex++)
        {
            if (logIndex == mdIndex)
                continue;

            const logNode = WellLogCreator.createLogNode(items, mdIndex, logIndex);
            if (!logNode)
                continue;

            if (!folder)
                folder = new LogFolder();
            folder.addChild(logNode);
        }
        return folder;
    }

    private static getMdIndex(columns: ILogRowColumn[]): number
    {
        for (let logIndex = 0; logIndex < columns.length; logIndex++)
        {
            let column = columns[logIndex];
            if (column.externalId === "DEPT")
                return logIndex;
        }
        return - 1;
    }

    private static createLogNode(items: ILogRow[], mdIndex: number, logIndex: number): BaseLogNode | null
    {
        const firstColumns = items[0].columns;
        const valueType = firstColumns[logIndex].valueType.toUpperCase();
        let logNode: BaseLogNode;
        
        if (valueType == "FLOAT" || valueType == "DOUBLE")
        {
            const log = WellLogCreator.createFloatLog(items, mdIndex, logIndex);
            if (!log)
                return null;

            logNode = new FloatLogNode();
            logNode.data = log;
        }
        else if (valueType == "INTEGER" || valueType == "LONG")
        {
            const log = WellLogCreator.createDiscreteLog(items, mdIndex, logIndex);
            if (!log)
                return null;

            logNode = new DiscreteLogNode();
            logNode.data = log;
        }
        else
        {
            console.warn("Unsupported log type", valueType);
            return null;
        }
        const name = firstColumns[logIndex].name;
        if (!Util.isEmpty(name))
            logNode.setName(name);
        return logNode;
    }

    //==================================================
    // STATIC METHODS: Creating logs
    //==================================================

    private static createDiscreteLog(items: ILogRow[], mdIndex: number, logIndex: number): DiscreteLog | null
    {
        const log = new DiscreteLog();
        for (const item of items)
        {
            const md = item[mdIndex];
            if (md == null)
                continue;

            const value = item[logIndex];
            if (value == null)
                continue;

            log.samples.push(new DiscreteLogSample(value, md * Units.Feet));
        }
        if (log.length === 0)
            return null;
        return log;
    }

    private static createFloatLog(items: ILogRow[], mdIndex: number, logIndex: number): FloatLog | null
    {
        const log = new FloatLog();
        for (const item of items)
        {
            const md = item[mdIndex];
            if (md == null)
                continue;

            const value = item[logIndex];
            if (value == null)
                continue;

            log.samples.push(new FloatLogSample(value, md * Units.Feet));
        }
        if (log.length === 0)
            return null;
        return log;
    }

    private static createRiskLog(events?: IRiskEvent[]): PointLog | null
    {
        if (!events)
            return null;

        const log = new PointLog();
        for (const event of events)
        {
            const metadata = event.metadata;
            const mdStart = Util.getNumberWithUnit(metadata.md_hole_start, metadata.md_hole_start_unit);
            if (Number.isNaN(mdStart))
                continue;

            const mdEnd = Util.getNumberWithUnit(metadata.md_hole_end, metadata.md_hole_end_unit);
            const sample = new PointLogSample(event.description, mdStart, mdEnd);

            sample.subtype = event.subtype;
            sample.riskSubCategory = metadata.risk_sub_category;
            sample.details = metadata.details;
            log.samples.push(sample);
        }
        log.sortByMd();
        if (log.length === 0)
            return null;
        return log;
    }
}
