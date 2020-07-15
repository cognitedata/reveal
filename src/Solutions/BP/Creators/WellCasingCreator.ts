import { ICasing } from "@/Interface";
import { CasingLogNode } from "@/SubSurface/Wells/Nodes/CasingLogNode";
import { CasingLogSample } from "@/SubSurface/Wells/Samples/CasingLogSample";
import { Util } from "@/Core/Primitives/Util";
import { Ma } from '@/Core/Primitives/Ma';
import { CasingLog } from '@/SubSurface/Wells/Logs/CasingLog';

export default class WellCasingCreator
{
    public static createCasingNodeNew(casings: ICasing[] | undefined, unit: number): CasingLogNode | null
    {
        const log = WellCasingCreator.createCasingLog(casings, unit);
        if (!log)
            return null;

        const logNode = new CasingLogNode();
        logNode.log = log;
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
            let radius = Util.getNumber(casing.metadata.assy_hole_size) / 2;
            if (Number.isNaN(radius))
                continue;

            let topMd = Util.getNumber(casing.metadata.assy_original_md_top);
            if (Number.isNaN(topMd))
                continue;

            let baseMd = Util.getNumber(casing.metadata.assy_original_md_base);
            if (Number.isNaN(baseMd))
                continue;

            radius *= unit;
            topMd *= unit;
            baseMd *= unit;

            const sample = new CasingLogSample(radius, topMd, baseMd);

            // Meta data to the min, the max may be taken out anyway.
            sample.name = casing.metadata.assy_name;
            sample.comments = casing.metadata.assy_comments;
            sample.currentStatusComment = casing.metadata.assy_current_status_comment;

            log.samples.push(sample);
        }
        if (log.length === 0)
            return null;

        const last = log.lastSample as CasingLogSample;
        last.radius = Number.NaN;

        // TODO: casing.metadata.assy_name
        return log;
    }
}

