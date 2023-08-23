## Running the application against a custom data model using platypus

1. Create a new data model in platypus (FDM UI), either using an existing space or create a new one.
2. Model your data model in a Graphql schema. At the time of writing the most up to date Graphql schema of the industrial canvas system data model looks like this

```gql
type ContainerReference {
  id: String
  containerReferenceType: String!
  resourceId: Int64!
  resourceSubId: Int64
  label: String

  properties: JSONObject

  x: Float
  y: Float
  width: Float
  height: Float
  maxWidth: Float
  maxHeight: Float
}

type FdmInstanceContainerReference {
  id: String

  containerReferenceType: String!

  instanceExternalId: String!
  instanceSpace: String!

  viewExternalId: String!
  viewSpace: String!
  viewVersion: String

  label: String
  properties: JSONObject

  x: Float
  y: Float
  width: Float
  height: Float
  maxWidth: Float
  maxHeight: Float
}

type CanvasAnnotation {
  id: String!
  annotationType: String!
  containerId: String
  isSelectable: Boolean
  isDraggable: Boolean
  isResizable: Boolean

  properties: JSONObject
}

type Canvas {
  visibility: String
  name: String!
  isArchived: Boolean

  createdBy: String!

  updatedAt: Timestamp!
  updatedBy: String!
  context: [JSONObject]

  containerReferences: [ContainerReference]
    @relation(
      type: {
        space: "ICTestModel2"
        externalId: "referencesContainerReference"
      }
    )
  fdmInstanceContainerReferences: [FdmInstanceContainerReference]
    @relation(
      type: {
        space: "ICTestModel2"
        externalId: "referencesFdmInstanceContainerReference"
      }
    )
  canvasAnnotations: [CanvasAnnotation]
    @relation(
      type: { space: "ICTestModel2", externalId: "referencesCanvasAnnotation" }
    )
}
```

3. Open `IndustryCanvasService.ts` and update these lines with the external-id, space-id and version of your data model.
   Using the same space as your data model for INSTANCE_SPACE will allow you to browse the data in data management in platypus as well which is helpful for debugging.

```ts
  public static readonly SYSTEM_SPACE = '<YOUR-SPACE>';
  // Note: To simplify the code, we assume that the data models and
  // the views in the system space always have the same version.
  public static readonly SYSTEM_SPACE_VERSION = '<YOUR-DATAMODEL-VERSION>';
  public static readonly INSTANCE_SPACE = '<YOUR-SPACE>';
  public static readonly DATA_MODEL_EXTERNAL_ID = '<YOUR-DATAMODEL-EXTERNAL-ID>';
```

4. Either ingest a node with external-id referencesContainerReference or enable `autoCreateDirectRelations: true`.
   The latter is the easiest. You can find it under the upsertEdges function in FDMClient. At the time of writing it's located [here](https://github.com/cognitedata/fusion/blob/3f47e18c711cf5d042de8384ae95ed908f653cb2/libs/industry-canvas/src/lib/utils/FDMClient.ts#L216)
