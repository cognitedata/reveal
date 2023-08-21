import { ProjectConfig } from './types';

export const celaneseConfig: ProjectConfig[] = [
  {
    project: 'celanese',
    site: 'Clear Lake',

    dataModels: [
      {
        externalId: 'AssetHierarchyDOM',
        space: 'EDG-COR-ALL-DMD',
        version: '1_0_11',
      },
      {
        externalId: 'LaboratoryDOM',
        space: 'EDG-COR-ALL-DMD',
        version: '1_0_3',
      },
      {
        externalId: 'MaintenanceDOM',
        space: 'EDG-COR-ALL-DMD',
        version: '1_0_3',
      },
      { externalId: 'MaterialDOM', space: 'EDG-COR-ALL-DMD', version: '1_0_0' },
    ],

    instanceSpaces: ['SAP-CLK-ALL-DAT', 'REF-COR-ALL-DAT'],

    threeDResources: [
      // Cad Models
      { modelId: 3549687449193361, revisionId: 5041726752464870 }, // CL-AAN 3D
      { modelId: 2746669744304978, revisionId: 4355007414745062 }, // CL-MS1 3D
      { modelId: 7696463898244179, revisionId: 6367717414128522 }, // CL-VAM 3D
      { modelId: 7575155737800092, revisionId: 3048357010596836 }, // CL-AAS 3D
      { modelId: 2443905386112325, revisionId: 6834222545723646 }, // CL-AAS-TFM 3D
      { modelId: 1327010631741187, revisionId: 5180084036560893 }, // CL-AAS Unit 3D
      { modelId: 1432805145863979, revisionId: 1765108410029578 }, // CL-AAS ARS 3D

      // Point Clouds
      { modelId: 1707174283089483, revisionId: 3891825420962845 }, // CL-VAM PC
      { modelId: 6360401938936856, revisionId: 7575340126509578 }, // CL-AAS-TFM PC
      { modelId: 7418476258090953, revisionId: 674626991444866 }, // CL-AAS-CLW PC
      { modelId: 6807777642171595, revisionId: 5632064072364261 }, // CL-AAS Area 1 PC
      { modelId: 5841567974217193, revisionId: 734161171584388 }, // CL-AAS Area 2A PC
      { modelId: 643091412047343, revisionId: 7478871931674216 }, // CL-AAS Area 2B PC
      { modelId: 6571380512908801, revisionId: 5420822560620399 }, // CL-AAS Area 3A PC
      { modelId: 257570340049750, revisionId: 7252631366950559 }, // CL-AAS Area 3B PC
      { modelId: 573305816458535, revisionId: 3524524444297081 }, // CL-AAS Area 4 PC

      // 360 Image Collections
      { siteId: 'cl-vam-a1-rev1' }, //CL-VAM-A1-Rev1
      { siteId: 'cl-vam-tfm-a1-rev1' }, //CL-VAM-TFM-A1-Rev1
      { siteId: 'cl-a2' }, //CL-A2
      { siteId: 'cl-a3' }, //CL-A3
      { siteId: 'cl-tf' }, //CL-TF
      { siteId: 'cl-a1' }, //CL-A1
      { siteId: 'cl-a4' }, //CL-A4
      { siteId: 'cl-ct' }, //CL-CT
      { siteId: 'g506-7000' }, //G506-7000
    ],

    fileConfig: {
      dataSetIds: [
        458928146976205 /* INFIELD_CL_AAS */,
        537876467980334 /* INFIELD_CL_LAB */,
        577102784440930 /* INFIELD_CL_RAD */,
        699149438684629 /* INFIELD_CL_LDR */,
        1193542368095732 /* INFIELD_CL_AAN */,
        1243271782091248 /* INFIELD_CL_MS1 */,
        4066738938965984 /* INFIELD_CL_MAINTENANCE */,
        4816535182232404 /* INFIELD_CL_UTL */,
        6146179318033854 /* INFIELD_CL_CO1 */,
        6809170575413045 /* INFIELD_CL_VAM */,
        419242285453812 /* INFIELD_CL_MS1_EMBER */,
        1031776763703334 /* BEN_CL_VINYL_ACETATE */,
        1418210165531299 /* BEN_CL_ACH_CONTROL_BLDG */,
        1623847913018004 /* BEN_CL_RAD */, 1849179526625207 /* BEN_CL_AAS */,
        3230671125870146 /* BEN_CL_ACH2 */, 3234033070833837 /* BEN_CL_CO */,
        3275300884281377 /* BEN_CL_MEOH */,
        4474306566543219 /* BEN_CL_PLANT_GENERAL */,
        4494348217692101 /* BEN_CL_SHIPPING_SERVICE_AREA */,
        5146211725631808 /* BEN_CL_UTILITY_AREAS */,
      ],
    },
    timeseriesConfig: {
      dataSetIds: [
        4342999022546281 /* PI_CL_RAD */,
        7181929102388170 /* PI_CL_ALL_BUT_RAD */,
        458928146976205 /* INFIELD_CL_AAS */,
        537876467980334 /* INFIELD_CL_LAB */,
        577102784440930 /* INFIELD_CL_RAD */,
        699149438684629 /* INFIELD_CL_LDR */,
        1193542368095732 /* INFIELD_CL_AAN */,
        1243271782091248 /* INFIELD_CL_MS1 */,
        4066738938965984 /* INFIELD_CL_MAINTENANCE */,
        4816535182232404 /* INFIELD_CL_UTL */,
        6146179318033854 /* INFIELD_CL_CO1 */,
        6809170575413045 /* INFIELD_CL_VAM */,
        419242285453812 /* INFIELD_CL_MS1_EMBER */,
      ],
    },
  },
  {
    project: 'celanese-stg',
    site: 'Clear Lake',

    dataModels: [
      {
        externalId: 'AssetHierarchyDOM',
        space: 'EDG-COR-ALL-DMD',
        version: '1_0_11',
      },
      {
        externalId: 'LaboratoryDOM',
        space: 'EDG-COR-ALL-DMD',
        version: '1_0_3',
      },
      {
        externalId: 'MaintenanceDOM',
        space: 'EDG-COR-ALL-DMD',
        version: '1_0_3',
      },
      { externalId: 'MaterialDOM', space: 'EDG-COR-ALL-DMD', version: '1_0_0' },
    ],
    instanceSpaces: ['SAP-COR-ALL-DAT', 'REF-COR-ALL-DAT'],

    threeDResources: [
      // Cad Models
      { modelId: 6549465888346781, revisionId: 4362684618748744 }, // CL-VAM 3D
    ],

    fileConfig: {
      dataSetIds: [
        6756242956839926 /* INFIELD_CL_VAM */,
        806994347852002 /* BEN_CL_VINYL_ACETATE */,
      ],
    },
    timeseriesConfig: {
      dataSetIds: [
        5049456225803383 /* PI_CL_ALL_BUT_RAD */,
        6756242956839926 /* INFIELD_CL_VAM */,
      ],
    },
  },
  {
    project: 'celanese-dev',
    site: ' ',

    threeDResources: [
      // Cad Models
      { modelId: 4506281922007984, revisionId: 1335075792330770 }, // CL-VAM 3D
    ],
  },
];
