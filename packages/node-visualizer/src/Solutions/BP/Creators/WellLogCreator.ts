import { DepthIndexTypeEnum } from '@cognite/sdk-wells';

import { BaseNode } from '../../../Core/Nodes/BaseNode';
import { Util } from '../../../Core/Primitives/Util';
import {
  ILog,
  ILogRow,
  ILogRowColumn,
} from '../../../SubSurface/Wells/Interfaces/ILog';
import {
  INdsMetadata,
  INptMetaData,
  IRiskEvent,
} from '../../../SubSurface/Wells/Interfaces/IRisk';
import { DiscreteLog } from '../../../SubSurface/Wells/Logs/DiscreteLog';
import { FloatLog } from '../../../SubSurface/Wells/Logs/FloatLog';
import { PointLog } from '../../../SubSurface/Wells/Logs/PointLog';
import { BaseLogNode } from '../../../SubSurface/Wells/Nodes/BaseLogNode';
import { DiscreteLogSample } from '../../../SubSurface/Wells/Samples/DiscreteLogSample';
import { DiscreteLogNode } from '../../../SubSurface/Wells/Nodes/DiscreteLogNode';
import { FloatLogNode } from '../../../SubSurface/Wells/Nodes/FloatLogNode';
import { LogFolder } from '../../../SubSurface/Wells/Nodes/LogFolder';
import { PointLogNode } from '../../../SubSurface/Wells/Nodes/PointLogNode';
import { FloatLogSample } from '../../../SubSurface/Wells/Samples/FloatLogSample';
import { PointLogSample } from '../../../SubSurface/Wells/Samples/PointLogSample';

export class WellLogCreator {
  //= =================================================
  // STATIC METHODS
  //= =================================================

  public static createNdsRiskLogNode(
    events: IRiskEvent<INdsMetadata>[] | null | undefined
  ): PointLogNode | null {
    if (!events) return null;

    const log = WellLogCreator.createNdsRiskLog(events);
    if (!log) return null;

    const node = new PointLogNode();
    node.log = log;
    return node;
  }

  public static createNptRiskLogNode(
    events: IRiskEvent<INptMetaData>[] | null | undefined
  ): PointLogNode | null {
    if (!events) return null;

    const log = WellLogCreator.createNptRiskLog(events);
    if (!log) return null;

    const node = new PointLogNode();
    node.log = log;
    return node;
  }

  public static addLogNodes(
    parent: BaseNode,
    logs: ILog[] | null,
    unit: number
  ): void {
    if (!logs) return;

    for (const log of logs) {
      const folder = WellLogCreator.createLogFolder(log.items, unit);
      if (folder) parent.addChild(folder);
    }
  }

  //= =================================================
  // STATIC METHODS: Helpers
  //= =================================================

  private static createLogFolder(
    items: ILogRow[] | null,
    unit: number
  ): LogFolder | null {
    if (items == null || items.length === 0) return null;

    const firstColumns = items[0].columns;
    const mdIndex: number = WellLogCreator.getMdIndex(firstColumns);
    if (mdIndex < 0) return null;

    let folder: LogFolder | null = null; // Lazy creation of this
    for (let logIndex = 0; logIndex < firstColumns.length; logIndex++) {
      if (logIndex === mdIndex) continue;

      const logNode = WellLogCreator.createLogNode(
        items,
        mdIndex,
        logIndex,
        unit
      );
      if (!logNode) continue;

      if (!folder) folder = new LogFolder();
      folder.addChild(logNode);
    }
    return folder;
  }

  private static getMdIndex(columns: ILogRowColumn[]): number {
    if (!columns) return -1;
    for (let logIndex = 0; logIndex < columns.length; logIndex++) {
      const column = columns[logIndex];
      if (column.name === DepthIndexTypeEnum.MeasuredDepth) {
        return logIndex;
      }
    }
    return -1;
  }

  private static createLogNode(
    items: ILogRow[],
    mdIndex: number,
    logIndex: number,
    unit: number
  ): BaseLogNode | null {
    const firstColumns = items[0].columns;
    const valueType = firstColumns[logIndex].valueType.toUpperCase();
    let logNode: BaseLogNode;

    if (valueType === 'FLOAT' || valueType === 'DOUBLE') {
      const log = WellLogCreator.createFloatLog(items, mdIndex, logIndex, unit);
      if (!log) return null;

      logNode = new FloatLogNode();
      logNode.log = log;
    } else if (valueType === 'INTEGER' || valueType === 'LONG') {
      const log = WellLogCreator.createDiscreteLog(
        items,
        mdIndex,
        logIndex,
        unit
      );
      if (!log) return null;

      logNode = new DiscreteLogNode();
      logNode.log = log;
    } else {
      // tslint:disable-next-line:no-console
      console.warn('Unsupported log type', valueType);
      return null;
    }
    const { name } = firstColumns[logIndex];
    if (!Util.isEmpty(name)) logNode.name = name;
    return logNode;
  }

  //= =================================================
  // STATIC METHODS: Creating logs
  //= =================================================

  private static createDiscreteLog(
    items: ILogRow[],
    mdIndex: number,
    logIndex: number,
    unit: number
  ): DiscreteLog | null {
    const log = new DiscreteLog();
    for (const item of items) {
      const md = item[mdIndex];
      if (md == null || Number.isNaN(md)) continue;

      let value = item[logIndex];
      if (value == null) value = Number.NaN; // NaN value is supported in the visualization

      log.samples.push(new DiscreteLogSample(value, md * unit));
    }
    if (log.length === 0) return null;

    log.sortByMd();
    return log;
  }

  private static createFloatLog(
    items: ILogRow[],
    mdIndex: number,
    logIndex: number,
    unit: number
  ): FloatLog | null {
    const log = new FloatLog();
    for (const item of items) {
      const md = item[mdIndex];
      if (md == null || Number.isNaN(md)) continue;

      let value = item[logIndex];
      if (value == null) value = Number.NaN; // NaN value is supported in the visualization

      log.samples.push(new FloatLogSample(value, md * unit));
    }
    if (log.length === 0) return null;

    log.sortByMd();
    return log;
  }

  private static createNdsRiskLog(
    events?: IRiskEvent<INdsMetadata>[]
  ): PointLog | null {
    if (!events) return null;

    const log = new PointLog();
    for (const event of events) {
      const { metadata } = event;
      const {
        md_hole_start: mdHoleStart,
        md_hole_start_unit: mdHoleStartUnit,
        md_hole_end: mdHoleEnd,
        risk_sub_category: riskSubCategory,
        details,
      } = metadata;

      let topMd = Number.NaN;
      if (mdHoleStart) {
        topMd = Util.getNumber(mdHoleStart);
      }

      let baseMd = Number.NaN;
      if (mdHoleEnd) {
        baseMd = Util.getNumber(mdHoleEnd);
      }

      const { subtype, description } = event;
      const sample = new PointLogSample(
        description,
        topMd,
        mdHoleStartUnit,
        baseMd
      );
      sample.subtype = subtype;
      if (riskSubCategory !== undefined)
        sample.riskSubCategory = riskSubCategory;
      if (details !== undefined) sample.details = details;

      log.samples.push(sample);
    }
    if (log.length === 0) return null;

    log.sortByMd();
    return log;
  }

  private static createNptRiskLog(
    events?: IRiskEvent<INptMetaData>[]
  ): PointLog | null {
    if (!events) return null;

    const log = new PointLog();
    for (const event of events) {
      const { metadata } = event;
      const { npt_md: nptMd, npt_md_unit: nptMdUnit } = metadata;

      let topMd = Number.NaN;
      if (nptMd !== undefined) {
        topMd = Util.getNumber(nptMd);
      }
      if (Number.isNaN(topMd)) {
        continue;
      }

      const { subtype, description } = event;
      const sample = new PointLogSample(description, topMd, nptMdUnit);
      sample.subtype = subtype;

      log.samples.push(sample);
    }
    if (log.length === 0) return null;

    log.sortByMd();
    return log;
  }
}
