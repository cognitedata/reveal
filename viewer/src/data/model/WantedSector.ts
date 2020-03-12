import { SectorMetadata } from "../../models/cad/types";
import { LevelOfDetail } from "./LevelOfDetail";

export interface WantedSector {
  id: number;
  levelOfDetail: LevelOfDetail;
  metadata: SectorMetadata;
}

