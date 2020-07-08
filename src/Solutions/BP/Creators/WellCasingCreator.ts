import { ICasing } from "@/Interface";
import { BaseLogNode } from "@/Nodes/Wells/Wells/BaseLogNode";
import { CasingLogNode } from "@/Nodes/Wells/Wells/CasingLogNode";
import { CasingLogSample } from "@/Nodes/Wells/Samples/CasingLogSample";
import { Util } from "@/Core/Primitives/Util";
import { Ma } from '@/Core/Primitives/Ma';
import { CasingLog } from '@/Nodes/Wells/Logs/CasingLog';

export default class WellCasingCreator
{
    public static createCasingNodeNew(casings: ICasing[] | undefined, unit: number): BaseLogNode | null
    {
        const log = WellCasingCreator.createCasingLog(casings, unit);
        if (!log)
            return null;

        const logNode = new CasingLogNode();
        logNode.data = log;
        return logNode;
    }

    public static createCasingLog(casings: ICasing[] | undefined, unit: number): CasingLog | null
    {
        if (!casings)
            return null;

        const sortedCasings = casings.sort((a: ICasing, b: ICasing) =>
        {
            const aStartPoint = Util.getNumber(a.metadata.assy_original_md_top);
            const bStartPoint = Util.getNumber(b.metadata.assy_original_md_top);
            return Ma.compare(aStartPoint, bStartPoint);
        });

        // TODO: casing.metadata.assy_name
        const log = new CasingLog();
        for (const casing of sortedCasings)
        {
            const radius = Util.getNumber(casing.metadata.assy_hole_size) * unit / 2;
            if (isNaN(radius))
                continue;

            let min = Util.getNumber(casing.metadata.assy_original_md_top);
            if (Number.isNaN(min))
                continue;

            let max = Util.getNumber(casing.metadata.assy_original_md_base);
            if (Number.isNaN(max))
                continue;

            min *= unit;
            max *= unit;
            var lastSample = log.last;
            if (lastSample)
            {
                if (Ma.IsAbsEqual(lastSample.md, min, 0.1))
                    log.samples.pop();
            }

            var minSample = new CasingLogSample(radius, min);
            minSample.name = casing.metadata.assy_name;
            minSample.comments = casing.metadata.assy_comments;
            minSample.currentStatusComment = casing.metadata.assy_current_status_comment; 
          
            log.samples.push(minSample);
            log.samples.push(new CasingLogSample(radius, max));
        }
        if (log.length === 0)
            return null;

        // TODO: casing.metadata.assy_name
        return log;
    }
}

