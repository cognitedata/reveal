import { BaseNode } from "@/Core/Nodes/BaseNode";
import { ICasing } from "@/Interface";
import { BaseLogNode } from "@/Nodes/Wells/Wells/BaseLogNode";
import { CasingLogNode } from "@/Nodes/Wells/Wells/CasingLogNode";
import { FloatLog } from "@/Nodes/Wells/Logs/FloatLog";
import { WellTrajectoryNode } from "@/Nodes/Wells/Wells/WellTrajectoryNode";
import { Range1 } from "@/Core/Geometry/Range1";
import { FloatLogSample } from "@/Nodes/Wells/Samples/FloatLogSample";
import { Util } from "@/Core/Primitives/Util";
import { SampleSize } from "@/UserInterface/constants/Common";

export default class WellCasingCreator
{
    //==================================================
    // STATIC METHODS
    //==================================================

    public static addCasingNodes(parent: BaseNode, casings: ICasing[] | undefined, unit: number): void
    {
        if (!casings)
            return;

        // sort casings in decreasing diameter so they appear large to small in tree control
        const sortedCasings = casings.sort((a: ICasing, b: ICasing) =>
        {
            const aStartPoint = Util.getNumber(a.metadata.assy_original_md_top);
            const bStartPoint = Util.getNumber(b.metadata.assy_original_md_top);
            if (aStartPoint < bStartPoint)
                return -1;
            if (aStartPoint > bStartPoint)
                return 1;
            return 0;
        });

        for (const casing of sortedCasings)
        {
            const folder = WellCasingCreator.createCasingNode(parent, casing, unit);
            if (folder)
                parent.addChild(folder);
        }
    }

    public static createCasingNode(parent: BaseNode, casing: ICasing, unit: number): BaseLogNode | null
    {

        if (!casing)
            return null;

        const radius = Util.getNumber(casing.metadata.assy_hole_size) * unit / 2;
        if (isNaN(radius))
            return null;

        const trajectory = (parent as WellTrajectoryNode).data;
        if (!trajectory)
            return null;

        const mdRange = new Range1 ( ) ;
        mdRange.min = parseFloat ( casing.metadata.assy_original_md_top ) ;
        mdRange.max = parseFloat ( casing.metadata.assy_original_md_base ) ;

        const logNode = new CasingLogNode();
        logNode.data = WellCasingCreator.createCasing(mdRange, radius);
        logNode.setName(casing.metadata.assy_name);

        return logNode;
    }

    //==================================================
    // STATIC METHODS: creating casing
    //==================================================


    public static createCasing(mdRange: Range1, radius: number): FloatLog
    {
        const casing = new FloatLog();
        const numSamples = SampleSize.LOG_RANGE_INCREMENTS;
        const mdInc = mdRange.delta / (numSamples - 1);

        for (let k = 0, md = mdRange.min; k < numSamples; k++, md += mdInc)
        {
            casing.samples.push(new FloatLogSample(radius, md));
        }
        casing.sortByMd();
        return casing;
    }

}