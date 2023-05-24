import { DataModelLibraryTemplateItem } from '.';

export const ISA88: DataModelLibraryTemplateItem = {
  name: 'ISA 88',
  description:
    'ISA-88, also known as the Batch Control standard, is a standard developed by the International Society of Automation (ISA) that defines models and terminology for batch control systems. It does not fall into a specific category of data models but rather provides guidelines for the design and implementation of batch processes in industrial automation.',
  category: 'Batch processing',
  versions: [
    {
      dml: `type Enterprise {
name: String!
id: Int!
sites: [Site]
}
type Site {
name: String!
id: Int!
areas: [Area]
recipe: Recipe
}
type Area {
name: String!
id: Int!
processcells: [ProcessCell]
recipe: Recipe
}
type ProcessCell {
name: String!
id: Int!
units: [Unit]
}
type Unit {
name: String!
id: Int!
unitprocedures: [UnitProcedure]
}
type RecipeRun {
name: String!
id: Int64!
batches: [Batch]
formulation: [Formulation]
}
type Product {
code: String!
description: String
id: Int64!
batches: [Batch]
}
type Formulation {
name: String!
description: String
id: Int64!
formulaType: FormulaType
formulaSubType: FormulaSubType
batches: [Batch]
recipes: [Recipe]
}
type Batch {
id: String!
batchid: String!
start: Timestamp!
end: Timestamp
uniqueid: String
isGB: Boolean
status: String
unitprocedures: [UnitProcedure]
bpi: Int
product: Product
recipe: Recipe
}
type UnitProcedure {
unitname: Unit
id: Int64!
name: String!
start: Timestamp
end: Timestamp
status: String
uniqueid: String
operations: [Operation]
}
type Operation {
id: Int64!
name: String!
start: Timestamp!
end: Timestamp
status: String
uniqueid: String
phases: [Phase]
}
type Phase {
id: Int64!
name: String!
start: Timestamp!
end: Timestamp
status: String
uniqueid: String
}

"""
A recipe entity is the combination of a procedural element with associated
recipe information (e.g., header, formula, equipment requirements and other
information). General, site, master, and control recipes are recipe entities. One
example is a unit recipe (ANSI/ISA-88.01-1995, 5.3.2). "unit recipe: the part of
a control recipe that uniquely defines the contiguous production requirements
for a unit." (ANSI/ISA-88.01-1995, 3.62).
"""
interface RecipeEntity {
"""
Provides unique Identification.""
"""
recipeEntityId : String
"""
Parameters are variables associated with recipe entities. These variables may be used by equipment procedural elements, they may be used by other activities (e.g., scheduling), or they may be referenced by other parts of the recipe (e.g., transition criteria) (see figure 7).
"""
recipeParameters : [RecipeParameter]
}

interface RecipeComponentEntity implements RecipeEntity {
"""
Provides unique Identification.""
"""
recipeEntityId : String
"""
Parameters are variables associated with recipe entities. These variables may be used by equipment procedural elements, they may be used by other activities (e.g., scheduling), or they may be referenced by other parts of the recipe (e.g., transition criteria) (see figure 7).
"""
recipeParameters : [RecipeParameter]
}

interface RecipeBuildingBlockEntity implements RecipeEntity {
"""
Provides unique Identification.""
"""
recipeEntityId : String
"""
Parameters are variables associated with recipe entities. These variables may be used by equipment procedural elements, they may be used by other activities (e.g., scheduling), or they may be referenced by other parts of the recipe (e.g., transition criteria) (see figure 7).
"""
recipeParameters : [RecipeParameter]
}

"""
A complete and self-contained general recipe.
All of a general or site recipe, a component of a general or site recipe, or a building block for creation of a general or site recipe.
"""
interface GeneralRecipeEntity implements RecipeEntity {
"""
Provides unique Identification.""
"""
recipeEntityId : String
"""
Parameters are variables associated with recipe entities. These variables may be used by equipment procedural elements, they may be used by other activities (e.g., scheduling), or they may be referenced by other parts of the recipe (e.g., transition criteria) (see figure 7).
"""
recipeParameters : [RecipeParameter]
"""
Defines a reference scale for the parameter values.
"""
scaleReference : Float
}

"""
A complete and self-contained site recipe.
All of a site recipe, a component of a site recipe, or a building block for creation of a site recipe.
"""
interface SiteRecipeEntity implements RecipeEntity {
"""
Provides unique Identification.""
"""
recipeEntityId : String
"""
Parameters are variables associated with recipe entities. These variables may be used by equipment procedural elements, they may be used by other activities (e.g., scheduling), or they may be referenced by other parts of the recipe (e.g., transition criteria) (see figure 7).
"""
recipeParameters : [RecipeParameter]
"""
Defines a reference scale for the parameter values.
"""
scaleReference : Float
}

"""
A complete and self-contained master recipe.
All of a master recipe, a component of a master recipe, or a building block for creation of a master recipe.
"""
interface MasterRecipeEntity implements RecipeEntity {
"""
Provides unique Identification.""
"""
recipeEntityId : String
"""
Parameters are variables associated with recipe entities. These variables may be used by equipment procedural elements, they may be used by other activities (e.g., scheduling), or they may be referenced by other parts of the recipe (e.g., transition criteria) (see figure 7).
"""
recipeParameters : [RecipeParameter]
"""
Defines a reference scale for the parameter values.
"""
scaleReference : Float
"""
Identifies the equipment category for which the recipe entity was defined (e.g., process cell or process cells for which this master recipe was defined).
"""
processCellID : ProcessCellType
}

"""
A complete and self-contained control recipe.
A recipe entity that is all of or a part of a control recipe.
"""
interface ControlRecipeEntity implements RecipeEntity {
"""
Provides unique Identification.""
"""
recipeEntityId : String
"""
Parameters are variables associated with recipe entities. These variables may be used by equipment procedural elements, they may be used by other activities (e.g., scheduling), or they may be referenced by other parts of the recipe (e.g., transition criteria) (see figure 7).
"""
recipeParameters : [RecipeParameter]
"""
Specifies the actual Batch ID.
"""
batchID : Batch
"""
Defines the requested size or scale factor for the batch, based on the scale factor for the batch as defined in the master recipe.
"""
batchSize : Float
"""
Status Describes execution status (e.g., not yet activated, active, or completed).
"""
executionsStatus : ExecutionStatus
}

type ExecutionStatus {
statusCode : String
statusDescription : String
}


"""
The top level recipe entity.
"""
interface Recipe implements RecipeEntity {
"""
Provides unique Identification.
"""
recipeEntityId : String
"""
Parameters are variables associated with recipe entities. These variables may be used by equipment procedural elements, they may be used by other activities (e.g., scheduling), or they may be referenced by other parts of the recipe (e.g., transition criteria) (see figure 7).
"""
recipeParameters : [RecipeParameter]
"""
Identifies the recipe. When combined with the "RecipeVersion," defines a unique instance of a recipe.
"""
recipeID : String
"""
Identifies the version of a recipe. When combined with a "RecipeID," defines a unique instance of a recipe (e.g., Red Oak - A10.3).
"""
recipeVersion : String
"""
Identifies the date and time that this version of the recipe was created or modified.
"""
versionDate : Timestamp
"""
Identifies the date and time that this version of the recipe was approved.
"""
approvalDate : Timestamp
"""
Identifies the date and time that this version of the recipe expires.
"""
effectiveDate : Timestamp
"""
Identifies the product or product family that would be created by execution of this version of the recipe (e.g., Premium Beer).
"""
productId : Product
"""
Identifies the person or system that authored this version of the recipe. (e.g., J. Smith).
"""
author : String
"""
Identifies the person or system that approved this version of the recipe.
"""
approvedBy : String
"""
Describes this version of the recipe and/or product (e.g., North Carolina’s Finest Premium Beer).
"""
description : String
"""
Defines the Status of the information (e.g., "Approved for Production", "Approved for Test", "Not Approved", "Inactive", "Obsolete").
"""
recipeStatus : RecipeStatus
}


"""
A recipe entity that is part of a recipe or building block (i.e., an instance of a building block in a particular recipe or containing building block recipe entity).
"""
interface RecipeComponent implements RecipeComponentEntity & RecipeEntity {
"""
Provides unique Identification.""
"""
recipeEntityId : String
"""
Parameters are variables associated with recipe entities. These variables may be used by equipment procedural elements, they may be used by other activities (e.g., scheduling), or they may be referenced by other parts of the recipe (e.g., transition criteria) (see figure 7).
"""
recipeParameters : [RecipeParameter]
"""
Indicates the procedural hierarchy level (i.e., process stage, process operation, or process action for general and site recipes and unit procedure, operation, or phase for master and control recipes).
"""
level : ProcessLevel
"""
Defines if the recipe component is a copy of a building block or a reference to it.
"""
re_Use : RE_Use

}

"""
A recipe entity that exists in a library. A building block can be parameterized and used when building recipes.
"""
interface RecipeBuildingBlock implements RecipeBuildingBlockEntity & RecipeEntity {
"""
Provides unique Identification.""
"""
recipeEntityId : String
"""
Parameters are variables associated with recipe entities. These variables may be used by equipment procedural elements, they may be used by other activities (e.g., scheduling), or they may be referenced by other parts of the recipe (e.g., transition criteria) (see figure 7).
"""
recipeParameters : [RecipeParameter]
"""
Identifies the version of the recipe entity.
"""
recipeVersion : String
"""
Identifies the date and time that this version of the recipe was created or modified.
"""
versionDate : Timestamp
"""
Identifies the date and time that this version of the recipe was approved.
"""
approvalDate: Timestamp
"""
Identifies the person or system that authored this version of the recipe. (e.g., J. Smith).
"""
author : String
"""
Identifies the person or system that approved this version of the recipe.
"""
approvedBy : String
"""
Describes this version of the recipe and/or product (e.g., North Carolina’s Finest Premium Beer).
"""
description : String
"""
Indicates the procedural hierarchy level (i.e., process stage, process operation, or process action for general and site recipes and unit procedure, operation, or phase for master and control recipes).
"""
level : ProcessLevel
"""
Defines the Status of the information (e.g., "Approved for Production", "Approved for Test", "Not Approved", "Inactive", "Obsolete").
"""
recipeStatus : RecipeStatus
"""
Defines how the recipe entity is executed (e.g., by referencing an equipment procedural element, through execution of contained logic).
"""
function : EquipmentProceduralElement
}

type ProcessLevel {
level : String
}

type ProcessCellType {
processCellId : String
}

type BatchStatus {
statusCode : String
}

type GeneralRecipe implements RecipeEntity & GeneralRecipeEntity & Recipe {
"""
Provides unique Identification.""
"""
recipeEntityId : String
"""
Parameters are variables associated with recipe entities. These variables may be used by equipment procedural elements, they may be used by other activities (e.g., scheduling), or they may be referenced by other parts of the recipe (e.g., transition criteria) (see figure 7).
"""
recipeParameters : [RecipeParameter]
"""
Defines a reference scale for the parameter values.
"""
scaleReference : Float
"""
Identifies the recipe. When combined with the "RecipeVersion," defines a unique instance of a recipe.
"""
recipeID : String
"""
Identifies the version of a recipe. When combined with a "RecipeID," defines a unique instance of a recipe (e.g., Red Oak - A10.3).
"""
recipeVersion : String
"""
Identifies the date and time that this version of the recipe was created or modified.
"""
versionDate : Timestamp
"""
Identifies the date and time that this version of the recipe was approved.
"""
approvalDate : Timestamp
"""
Identifies the date and time that this version of the recipe expires.
"""
effectiveDate : Timestamp
"""
Identifies the product or product family that would be created by execution of this version of the recipe (e.g., Premium Beer).
"""
productId : Product
"""
Identifies the person or system that authored this version of the recipe. (e.g., J. Smith).
"""
author : String
"""
Identifies the person or system that approved this version of the recipe.
"""
approvedBy : String
"""
Describes this version of the recipe and/or product (e.g., North Carolina’s Finest Premium Beer).
"""
description : String
"""
Defines the Status of the information (e.g., "Approved for Production", "Approved for Test", "Not Approved", "Inactive", "Obsolete").
"""
recipeStatus : RecipeStatus

}

type GeneralRecipeComponent implements RecipeComponentEntity & GeneralRecipeEntity & RecipeComponent & RecipeEntity {

"""
Provides unique Identification.""
"""
recipeEntityId : String
"""
Parameters are variables associated with recipe entities. These variables may be used by equipment procedural elements, they may be used by other activities (e.g., scheduling), or they may be referenced by other parts of the recipe (e.g., transition criteria) (see figure 7).
"""
recipeParameters : [RecipeParameter]
"""
Defines a reference scale for the parameter values.
"""
scaleReference : Float
"""
Indicates the procedural hierarchy level (i.e., process stage, process operation, or process action for general and site recipes and unit procedure, operation, or phase for master and control recipes).
"""
level : ProcessLevel
"""
Defines if the recipe component is a copy of a building block or a reference to it.
"""
re_Use : RE_Use
}

type GeneralRecipeBuildingBlock implements RecipeBuildingBlockEntity & GeneralRecipeEntity & RecipeBuildingBlock & RecipeEntity {

"""
Provides unique Identification.""
"""
recipeEntityId : String
"""
Parameters are variables associated with recipe entities. These variables may be used by equipment procedural elements, they may be used by other activities (e.g., scheduling), or they may be referenced by other parts of the recipe (e.g., transition criteria) (see figure 7).
"""
recipeParameters : [RecipeParameter]
"""
Defines a reference scale for the parameter values.
"""
scaleReference : Float
"""
Identifies the version of the recipe entity.
"""
recipeVersion : String
"""
Identifies the date and time that this version of the recipe was created or modified.
"""
versionDate : Timestamp
"""
Identifies the date and time that this version of the recipe was approved.
"""
approvalDate: Timestamp
"""
Identifies the person or system that authored this version of the recipe. (e.g., J. Smith).
"""
author : String
"""
Identifies the person or system that approved this version of the recipe.
"""
approvedBy : String
"""
Describes this version of the recipe and/or product (e.g., North Carolina’s Finest Premium Beer).
"""
description : String
"""
Indicates the procedural hierarchy level (i.e., process stage, process operation, or process action for general and site recipes and unit procedure, operation, or phase for master and control recipes).
"""
level : ProcessLevel
"""
Defines the Status of the information (e.g., "Approved for Production", "Approved for Test", "Not Approved", "Inactive", "Obsolete").
"""
recipeStatus : RecipeStatus
"""
Defines how the recipe entity is executed (e.g., by referencing an equipment procedural element, through execution of contained logic).
"""
function : EquipmentProceduralElement
}


type SiteRecipe implements RecipeEntity & SiteRecipeEntity & Recipe {
"""
Provides unique Identification.""
"""
recipeEntityId : String
"""
Parameters are variables associated with recipe entities. These variables may be used by equipment procedural elements, they may be used by other activities (e.g., scheduling), or they may be referenced by other parts of the recipe (e.g., transition criteria) (see figure 7).
"""
recipeParameters : [RecipeParameter]
"""
Defines a reference scale for the parameter values.
"""
scaleReference : Float
"""
Identifies the recipe. When combined with the "RecipeVersion," defines a unique instance of a recipe.
"""
recipeID : String
"""
Identifies the version of a recipe. When combined with a "RecipeID," defines a unique instance of a recipe (e.g., Red Oak - A10.3).
"""
recipeVersion : String
"""
Identifies the date and time that this version of the recipe was created or modified.
"""
versionDate : Timestamp
"""
Identifies the date and time that this version of the recipe was approved.
"""
approvalDate : Timestamp
"""
Identifies the date and time that this version of the recipe expires.
"""
effectiveDate : Timestamp
"""
Identifies the product or product family that would be created by execution of this version of the recipe (e.g., Premium Beer).
"""
productId : Product
"""
Identifies the person or system that authored this version of the recipe. (e.g., J. Smith).
"""
author : String
"""
Identifies the person or system that approved this version of the recipe.
"""
approvedBy : String
"""
Describes this version of the recipe and/or product (e.g., North Carolina’s Finest Premium Beer).
"""
description : String
"""
Defines the Status of the information (e.g., "Approved for Production", "Approved for Test", "Not Approved", "Inactive", "Obsolete").
"""
recipeStatus : RecipeStatus

}

type SiteRecipeComponent implements RecipeComponentEntity & SiteRecipeEntity & RecipeComponent & RecipeEntity {

"""
Provides unique Identification.""
"""
recipeEntityId : String
"""
Parameters are variables associated with recipe entities. These variables may be used by equipment procedural elements, they may be used by other activities (e.g., scheduling), or they may be referenced by other parts of the recipe (e.g., transition criteria) (see figure 7).
"""
recipeParameters : [RecipeParameter]
"""
Defines a reference scale for the parameter values.
"""
scaleReference : Float
"""
Indicates the procedural hierarchy level (i.e., process stage, process operation, or process action for general and site recipes and unit procedure, operation, or phase for master and control recipes).
"""
level : ProcessLevel
"""
Defines if the recipe component is a copy of a building block or a reference to it.
"""
re_Use : RE_Use
}

type SiteRecipeBuildingBlock implements RecipeBuildingBlockEntity & SiteRecipeEntity & RecipeBuildingBlock & RecipeEntity {

"""
Provides unique Identification.""
"""
recipeEntityId : String
"""
Parameters are variables associated with recipe entities. These variables may be used by equipment procedural elements, they may be used by other activities (e.g., scheduling), or they may be referenced by other parts of the recipe (e.g., transition criteria) (see figure 7).
"""
recipeParameters : [RecipeParameter]
"""
Defines a reference scale for the parameter values.
"""
scaleReference : Float
"""
Identifies the version of the recipe entity.
"""
recipeVersion : String
"""
Identifies the date and time that this version of the recipe was created or modified.
"""
versionDate : Timestamp
"""
Identifies the date and time that this version of the recipe was approved.
"""
approvalDate: Timestamp
"""
Identifies the person or system that authored this version of the recipe. (e.g., J. Smith).
"""
author : String
"""
Identifies the person or system that approved this version of the recipe.
"""
approvedBy : String
"""
Describes this version of the recipe and/or product (e.g., North Carolina’s Finest Premium Beer).
"""
description : String
"""
Indicates the procedural hierarchy level (i.e., process stage, process operation, or process action for general and site recipes and unit procedure, operation, or phase for master and control recipes).
"""
level : ProcessLevel
"""
Defines the Status of the information (e.g., "Approved for Production", "Approved for Test", "Not Approved", "Inactive", "Obsolete").
"""
recipeStatus : RecipeStatus
"""
Defines how the recipe entity is executed (e.g., by referencing an equipment procedural element, through execution of contained logic).
"""
function : EquipmentProceduralElement
}



type MasterRecipe implements RecipeEntity & MasterRecipeEntity & Recipe {
"""
Provides unique Identification.""
"""
recipeEntityId : String
"""
Parameters are variables associated with recipe entities. These variables may be used by equipment procedural elements, they may be used by other activities (e.g., scheduling), or they may be referenced by other parts of the recipe (e.g., transition criteria) (see figure 7).
"""
recipeParameters : [RecipeParameter]
"""
Defines a reference scale for the parameter values.
"""
scaleReference : Float
"""
Identifies the equipment category for which the recipe entity was defined (e.g., process cell or process cells for which this master recipe was defined).
"""
processCellID : ProcessCellType
"""
Identifies the recipe. When combined with the "RecipeVersion," defines a unique instance of a recipe.
"""
recipeID : String
"""
Identifies the version of a recipe. When combined with a "RecipeID," defines a unique instance of a recipe (e.g., Red Oak - A10.3).
"""
recipeVersion : String
"""
Identifies the date and time that this version of the recipe was created or modified.
"""
versionDate : Timestamp
"""
Identifies the date and time that this version of the recipe was approved.
"""
approvalDate : Timestamp
"""
Identifies the date and time that this version of the recipe expires.
"""
effectiveDate : Timestamp
"""
Identifies the product or product family that would be created by execution of this version of the recipe (e.g., Premium Beer).
"""
productId : Product
"""
Identifies the person or system that authored this version of the recipe. (e.g., J. Smith).
"""
author : String
"""
Identifies the person or system that approved this version of the recipe.
"""
approvedBy : String
"""
Describes this version of the recipe and/or product (e.g., North Carolina’s Finest Premium Beer).
"""
description : String
"""
Defines the Status of the information (e.g., "Approved for Production", "Approved for Test", "Not Approved", "Inactive", "Obsolete").
"""
recipeStatus : RecipeStatus

}

type MasterRecipeComponent implements RecipeComponentEntity & MasterRecipeEntity & RecipeComponent & RecipeEntity {

"""
Provides unique Identification.""
"""
recipeEntityId : String
"""
Parameters are variables associated with recipe entities. These variables may be used by equipment procedural elements, they may be used by other activities (e.g., scheduling), or they may be referenced by other parts of the recipe (e.g., transition criteria) (see figure 7).
"""
recipeParameters : [RecipeParameter]
"""
Defines a reference scale for the parameter values.
"""
scaleReference : Float
"""
Identifies the equipment category for which the recipe entity was defined (e.g., process cell or process cells for which this master recipe was defined).
"""
processCellID : ProcessCellType
"""
Indicates the procedural hierarchy level (i.e., process stage, process operation, or process action for general and site recipes and unit procedure, operation, or phase for master and control recipes).
"""
level : ProcessLevel
"""
Defines if the recipe component is a copy of a building block or a reference to it.
"""
re_Use : RE_Use
}

type MasterRecipeBuildingBlock implements RecipeBuildingBlockEntity & MasterRecipeEntity & RecipeBuildingBlock & RecipeEntity {

"""
Provides unique Identification.""
"""
recipeEntityId : String
"""
Parameters are variables associated with recipe entities. These variables may be used by equipment procedural elements, they may be used by other activities (e.g., scheduling), or they may be referenced by other parts of the recipe (e.g., transition criteria) (see figure 7).
"""
recipeParameters : [RecipeParameter]
"""
Defines a reference scale for the parameter values.
"""
scaleReference : Float
"""
Identifies the equipment category for which the recipe entity was defined (e.g., process cell or process cells for which this master recipe was defined).
"""
processCellID : ProcessCellType
"""
Identifies the version of the recipe entity.
"""
recipeVersion : String
"""
Identifies the date and time that this version of the recipe was created or modified.
"""
versionDate : Timestamp
"""
Identifies the date and time that this version of the recipe was approved.
"""
approvalDate: Timestamp
"""
Identifies the person or system that authored this version of the recipe. (e.g., J. Smith).
"""
author : String
"""
Identifies the person or system that approved this version of the recipe.
"""
approvedBy : String
"""
Describes this version of the recipe and/or product (e.g., North Carolina’s Finest Premium Beer).
"""
description : String
"""
Indicates the procedural hierarchy level (i.e., process stage, process operation, or process action for general and site recipes and unit procedure, operation, or phase for master and control recipes).
"""
level : ProcessLevel
"""
Defines the Status of the information (e.g., "Approved for Production", "Approved for Test", "Not Approved", "Inactive", "Obsolete").
"""
recipeStatus : RecipeStatus
"""
Defines how the recipe entity is executed (e.g., by referencing an equipment procedural element, through execution of contained logic).
"""
function : EquipmentProceduralElement
}


type ControlRecipe implements RecipeEntity & ControlRecipeEntity & Recipe {
"""
Provides unique Identification.""
"""
recipeEntityId : String
"""
Parameters are variables associated with recipe entities. These variables may be used by equipment procedural elements, they may be used by other activities (e.g., scheduling), or they may be referenced by other parts of the recipe (e.g., transition criteria) (see figure 7).
"""
recipeParameters : [RecipeParameter]
"""
Defines a reference scale for the parameter values.
"""
scaleReference : Float
"""
Specifies the actual Batch ID.
"""
batchID : Batch
"""
Defines the requested size or scale factor for the batch, based on the scale factor for the batch as defined in the master recipe.
"""
batchSize : Float
"""
Status Describes execution status (e.g., not yet activated, active, or completed).
"""
batchStatus : BatchStatus
"""
Identifies the recipe. When combined with the "RecipeVersion," defines a unique instance of a recipe.
"""
recipeID : String
"""
Identifies the version of a recipe. When combined with a "RecipeID," defines a unique instance of a recipe (e.g., Red Oak - A10.3).
"""
recipeVersion : String
"""
Identifies the date and time that this version of the recipe was created or modified.
"""
versionDate : Timestamp
"""
Identifies the date and time that this version of the recipe was approved.
"""
approvalDate : Timestamp
"""
Identifies the date and time that this version of the recipe expires.
"""
effectiveDate : Timestamp
"""
Identifies the product or product family that would be created by execution of this version of the recipe (e.g., Premium Beer).
"""
productId : Product
"""
Identifies the person or system that authored this version of the recipe. (e.g., J. Smith).
"""
author : String
"""
Identifies the person or system that approved this version of the recipe.
"""
approvedBy : String
"""
Describes this version of the recipe and/or product (e.g., North Carolina’s Finest Premium Beer).
"""
description : String
"""
Defines the Status of the information (e.g., "Approved for Production", "Approved for Test", "Not Approved", "Inactive", "Obsolete").
"""
recipeStatus : RecipeStatus
"""
Status Describes execution status (e.g., not yet activated, active, or completed).
"""
executionsStatus : ExecutionStatus

}

type ControlRecipeComponent implements RecipeComponentEntity & ControlRecipeEntity & RecipeComponent & RecipeEntity {

"""
Provides unique Identification.""
"""
recipeEntityId : String
"""
Parameters are variables associated with recipe entities. These variables may be used by equipment procedural elements, they may be used by other activities (e.g., scheduling), or they may be referenced by other parts of the recipe (e.g., transition criteria) (see figure 7).
"""
recipeParameters : [RecipeParameter]
"""
Defines a reference scale for the parameter values.
"""
scaleReference : Float
"""
Specifies the actual Batch ID.
"""
batchID : Batch
"""
Defines the requested size or scale factor for the batch, based on the scale factor for the batch as defined in the master recipe.
"""
batchSize : Float
"""
Status Describes execution status (e.g., not yet activated, active, or completed).
"""
batchStatus : BatchStatus
"""
Indicates the procedural hierarchy level (i.e., process stage, process operation, or process action for general and site recipes and unit procedure, operation, or phase for master and control recipes).
"""
level : ProcessLevel
"""
Defines if the recipe component is a copy of a building block or a reference to it.
"""
re_Use : RE_Use
"""
Status Describes execution status (e.g., not yet activated, active, or completed).
"""
executionsStatus : ExecutionStatus
}

type ControlRecipeBuildingBlock implements RecipeBuildingBlockEntity & ControlRecipeEntity & RecipeBuildingBlock & RecipeEntity {

"""
Provides unique Identification.""
"""
recipeEntityId : String
"""
Parameters are variables associated with recipe entities. These variables may be used by equipment procedural elements, they may be used by other activities (e.g., scheduling), or they may be referenced by other parts of the recipe (e.g., transition criteria) (see figure 7).
"""
recipeParameters : [RecipeParameter]
"""
Defines a reference scale for the parameter values.
"""
scaleReference : Float
"""
Specifies the actual Batch ID.
"""
batchID : Batch
"""
Defines the requested size or scale factor for the batch, based on the scale factor for the batch as defined in the master recipe.
"""
batchSize : Float
"""
Status Describes execution status (e.g., not yet activated, active, or completed).
"""
batchStatus : BatchStatus
"""
Identifies the version of the recipe entity.
"""
recipeVersion : String
"""
Identifies the date and time that this version of the recipe was created or modified.
"""
versionDate : Timestamp
"""
Identifies the date and time that this version of the recipe was approved.
"""
approvalDate: Timestamp
"""
Identifies the person or system that authored this version of the recipe. (e.g., J. Smith).
"""
author : String
"""
Identifies the person or system that approved this version of the recipe.
"""
approvedBy : String
"""
Describes this version of the recipe and/or product (e.g., North Carolina’s Finest Premium Beer).
"""
description : String
"""
Indicates the procedural hierarchy level (i.e., process stage, process operation, or process action for general and site recipes and unit procedure, operation, or phase for master and control recipes).
"""
level : ProcessLevel
"""
Defines the Status of the information (e.g., "Approved for Production", "Approved for Test", "Not Approved", "Inactive", "Obsolete").
"""
recipeStatus : RecipeStatus
"""
Defines how the recipe entity is executed (e.g., by referencing an equipment procedural element, through execution of contained logic).
"""
function : EquipmentProceduralElement
"""
Status Describes execution status (e.g., not yet activated, active, or completed).
"""
executionsStatus : ExecutionStatus
}

"""
Formula values or placeholders for values that are to be communicated to and from recipe entities during execution.
"""
type RecipeParameter {
"""
Provides unique identification.
"""
parameterID : String
"""
Specifies how the parameter value is interpreted (e.g., constant, reference equation).
"""
parameterType : ParameterType
"""
Describes the parameter or use of the parameter.
"""
desription : String
"""
Identifies the engineering units of measure for the Value (e.g., kg, pounds).
"""
engineeringUnits : [EngineeringUnit]
"""
Contains the parameter value. If Value is a relation, it contains the equation form, deferral rule or whatever ties the related parameters together. If Value is building block parameter, this attribute will hold the default value.
"""
value : ValueOrReference
"""
Specifies the scaling rule. Simplest case: scaled or not scaled with batch reference size.
"""
scaled : Float
"""
Specifies the parameter as a process input, process output, or process parameter.
"""
usage : ParameterUse
}

"""
Specifies how the parameter value is interpreted (e.g., constant, reference equation).
"""
type ParameterType {
parameterTypeCode : String
parameterTypeDescription : String
}

"""
Contains a parameter value. If Value is a relation, it contains the equation,
form, deferral rule or whatever ties the related parameters together. If Value is
a building block parameter, this attribute will hold the default value.
"""
type ValueOrReference {
valueType : ValueType
valueDataType : ValueDataType
valueIfNumeric : Int
valueDefaultIfBuildingBlock : ValueOrReference
valueIfReference : String
valueIfFormula : String
}

"""
Identifies the engineering units of measure for the Value (e.g., kg, pounds).
"""
type EngineeringUnit {
engineeringUnitCode :, String
engineeeringUnitSymbol : String
engineeringUnitDimension : String
}

"""
Specifies the parameter as a process input, process output, or process parameter.
"""
type ParameterUse {
parameterUsage : String
}

"""
Represents an equipment requirement as specified in the recipe entity.
"""
type EquipmentRequirement {
requiredEquipment : EquipmentEntity
equipmentProperties : [EquipmentProperty]
}

"""
A collection of physical processing and control equipment and equipment control that is grouped together to perform a certain control function or set of control functions.
"""
interface EquipmentEntity {
"""
Provides unique identification.
"""
equipmentEntityID : String
"""
Specifies the physical hierarchy level (e.g., process cell, unit, equipment module, control module).
"""
equipmentLevel : EquipmentLevel
"""
Indicates the current mode of the equipment entity.
"""
mode : ProceduralElementMode
"""
Indicates the current state of the equipment entity.
"""
state : ProceduralElementState
}

type EquipmentClass implements EquipmentEntity {
"""
Provides unique identification.
"""
equipmentEntityID : String
"""
Specifies the physical hierarchy level (e.g., process cell, unit, equipment module, control module).
"""
equipmentLevel : EquipmentLevel
"""
Indicates the current mode of the equipment entity.
"""
mode : ProceduralElementMode
"""
Indicates the current state of the equipment entity.
"""
state : ProceduralElementState
"""
POOPDAHL ADDON: Properties used for the equipment
"""
properties : [EquipmentProperty]
"""
POOPDAHL COMMENT ???? Should each class have one or more EquipmentProceduralElement ?????
"""
proceduralElement : [EquipmentProceduralElement]
}

"""
POOPDAHL ADDON : The standard discusses Equipment that are not associated with Equipment Class, but are identified directly as instances.
"""
type Equipment implements EquipmentEntity {
"""
Provides unique identification.
"""
equipmentEntityID : String
"""
Specifies the physical hierarchy level (e.g., process cell, unit, equipment module, control module).
"""
equipmentLevel : EquipmentLevel
"""
Indicates the current mode of the equipment entity.
"""
mode : ProceduralElementMode
"""
Indicates the current state of the equipment entity.
"""
state : ProceduralElementState
"""
POOPDAHL ADDON: Properties used for the equipment
"""
properties : [EquipmentProperty]
"""
POOPDAHL COMMENT ???? Should each class have one or more EquipmentProceduralElement ?????
"""
proceduralElement : [EquipmentProceduralElement]
}


"""
Identifies a property that the equipment entity or class supplies. These properties are application specific (e.g., lining type, size, heat capability, steam temperature).
"""
type EquipmentProperty {
"""
Provides unique identification.
"""
propertyID: String
"""
Identifies the value of the property (e.g., glass, 50000, 650).
"""
value : ValueOrReference
"""
Defines limits or constraints that are related to Value.
"""
valueRange : String
"""
Defines the engineering units of the property.
"""
engineeringUnits : [EngineeringUnit]
"""
Describes the type of the equipment property.
"""
description : String
"""
POOPDAHL ADDON : Property type for according to the general class of equipment attributes (e.g., lining type, size, heat capability, steam temperature).
"""
propertyType : EquipmentPropertyType
}

"""
The general class of equipment attributes (e.g., lining type, size, heat capability, steam temperature).
"""
type EquipmentPropertyType {
propertyTypeCode : String
propertyTypeDescription : String
}

"""
A category of recipe information that may contain batch processing support information that is not contained in other parts of the recipe (e.g., regulatory compliance information, materials and process safety information, process flow diagrams, packaging/labeling information).
"""
type RecipeOtherInformation {
referenceCode : String
information : String
}

"""
The recipe procedural elements and the ordering information for their execution.
Recipe procedure contains unit procedures that contain operations that contain phases).
"""
interface ProceduralStructuralElement {
proceduralElementID : String
}

"""
A procedural element that is associated with a piece of equipment (e.g., an equipment phase or equipment operation).
"""
type EquipmentProceduralElement implements ProceduralStructuralElement{
proceduralElementID : String
"""
Provides unique identification.
"""
equipmentProceduralElementID : String
"""
Identifies the version of the procedural element.
"""
version : String
"""
Identifies the date and time that this version was created or modified.
"""
versionDate : Timestamp
"""
Identifies the date and time that this version was approved.
"""
approvalDate : Timestamp
"""
Identifies the person or system that authored this version (e.g., J. Smith).
"""
author : String
"""
Identifies the person or system that approved this version.
"""
approvedBy : String
"""
Describes the function that is achieved through execution of the recipe entity.
"""
description : String
"""
Indicates the level of the equipment entity. The equipment entity may only be used at this level.
"""
level : EquipmentLevel
"""
Indicates the current mode of the procedural element.
"""
mode : ProceduralElementMode
"""
Indicates the current state of the procedural element.
"""
state : ProceduralElementState
}

"""
Indicates the current mode of the procedural element.
"""
type ProceduralElementMode {
mode : String
}

"""
Indicates the current state of the procedural element.
"""
type ProceduralElementState {
state : String
}

"""
A scheduled item that represents a unit procedure in a batch, a complete batch, or a set of batches (e.g., a campaign).
"""
type BatchScheduleEntry {
"""
Provides unique identification (e.g., actual campaign, lot, batch ID, procedural entity ID).
"""
id : String
"""
Specifies the hierarchy level (e.g., campaign, batch, unit procedure).
"""
level : BatchLevel
"""
Defines the requested size or scale factor for the batch, based on the scale factor for the batch as defined in the master recipe.
"""
batchSize : Float
"""
Defines scheduled execution times (start/stop).
"""
schedule : String
"""
Specifies resource usage for this schedule entry.
"""
resourceUsage : [EquipmentEntity]
"""
Specifies schedule status (e.g., proposed for evaluation (such as what-if analysis), planned, committed, started, completed).
"""
scheduleStatus : ScheduleStatus
"""
POOPDAHL ADDON : Schedule Relation Concept
A representation of relations between schedule entries (e.g., required line clearance, cleaning between scheduled items, specifications of sequential relations within a procedure).
"""
executeOrder : Int
"""
POOPDAHL ADDON : Schedule Relation Concept -  Alternative implementation
A representation of relations between schedule entries (e.g., required line clearance, cleaning between scheduled items, specifications of sequential relations within a procedure).
"""
executeBefore : BatchScheduleEntry
"""
POOPDAHL ADDON : Schedule Relation Concept -  Alternative implementation
A representation of relations between schedule entries (e.g., required line clearance, cleaning between scheduled items, specifications of sequential relations within a procedure).
"""
executeAfter : BatchScheduleEntry
}

type BatchLevel {
batchLevelCode : String
batchLevelDescription : String
}

"""
Information generated during the production of a batch.
"""
interface ProductionInformation {
"""
Provides unique identification.
"""
entryID : String
}

"""
Data that relates to one batch history entry.
"""
interface BatchSpecificInformation implements CommonInformation & ProductionInformation {
"""
Defines the actual Batch ID.
"""
batchID : Batch
"""
Provides unique identification.
"""
entryID : String
"""
Indicates the current actual value.
"""
newValue : ValueOrReference
"""
Defines the engineering units, if any, that are appropriate for the NewValue.
"""
engineeringUnits : [EngineeringUnit]
"""
Identifies an equipment element that may be associated with the entry.
"""
equipmentID : EquipmentEntity
"""
Identifies the Universal Coordinated Time (UTC) and date of the recorded entry.
"""
utc : Timestamp
"""
Identifies the user, if any, who is associated with the change.
"""
userID : String
}

"""
An item of information that documents batch production.
"""
type BatchHistory implements ProductionInformation{
"""
Provides unique identification.
"""
entryID : String
"""
Defines the actual Batch ID.
"""
batchID : [Batch]
}

type BatchReport implements BatchSpecificInformation & ProductionInformation & CommonInformation {
"""
Provides unique identification.
"""
entryID : String
"""
Provides unique identification. 
POOPDAHL COMMENT :  Should be mapped to the entryID of ProductionInformation
"""
reportID : String
"""
Defines the actual Batch ID.
"""
batchID : Batch
"""
Indicates the current actual value.
"""
newValue : ValueOrReference
"""
Defines the engineering units, if any, that are appropriate for the NewValue.
"""
engineeringUnits : [EngineeringUnit]
"""
Identifies an equipment element that may be associated with the entry.
"""
equipmentID : EquipmentEntity
"""
Identifies the Universal Coordinated Time (UTC) and date of the recorded entry.
"""
utc : Timestamp
"""
Identifies the user, if any, who is associated with the change.
"""
userID : String
}

"""
Data that relates to more than one batch history entry (e.g., cooling water temperature, atmospheric pressure, steam capacity).
"""
interface CommonInformation implements ProductionInformation {
"""
Provides unique Identification.
"""
entryID : String
"""
Indicates the current actual value.
"""
newValue : ValueOrReference
"""
Defines the engineering units, if any, that are appropriate for the NewValue.
"""
engineeringUnits : [EngineeringUnit]
"""
Identifies an equipment element that may be associated with the entry.
"""
equipmentID : EquipmentEntity
"""
Identifies the Universal Coordinated Time (UTC) and date of the recorded entry.
"""
utc : Timestamp
"""
Identifies the user, if any, who is associated with the change.
"""
userID : String
}

"""
A representation of a recipe entity (e.g., equipment procedural element) that has been executed.
"""
type ExecutedProceduralEntity implements ProductionInformation {
"""
Provides unique identification.
"""
entryID : String
"""
Provides a unique identification. 
POOPDAHL COMMENT :  Should be mapped to the entryID of ProductionInformation
"""
ExecutedProceduralEntityID :  String
"""
Uniquely identifies repeated execution of the same procedural entity.
"""
proceduralEntityCounter : String
} 


"""
Many of the tables contain fields that can contain standard or user-defined enumerated items. These
enumerated items are passed as numbers in the exchange tables, with the strings contained in an
enumeration set table.
"""
interface EnumerationSet {
"""
Identifies the standard enumeration set.
"""
enumSet : String
"""
Contains the use of the enumeration set. (Provided to assist in the translation of the TextString.)
"""
description: String
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValues : [EnumerationValue]
}

interface EnumerationValue {
"""
Identifies the standard enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration set. (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Defines a set of Boolean values.
"""
type BooleanEnumeration implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Defines how a parameter is intended to be handled.
"""
type DirectionType implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Defines the equipment hierarchical level for equipment elements.
"""
type EquipmentLevel implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Defines the type of equipment record for equipment elements (i.e., Class definition or Element definition).
"""
type EquipmentType implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Defines the evaluation rules for equipment properties.
"""
type EvaluationRule implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Defines the recipe formula types.
"""
type FormulaType implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Specifies user-supplied formula sub type definitions.
"""
type FormulaSubType implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Defines how links between recipe elements are to be depicted.
"""
type LinkDepiction implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Defines if a link is referencing a step or transition.
"""
type LinkToType implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Defines the type of link.
"""
type LinkType implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Defines the recipe element (RE), either recipe procedure level orallocation symbol.
"""
type RE_Type implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Defines how a recipe element (RE) is used in a recipe.
"""
type RE_Use implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Definition of the possible status of a recipe.
"""
type RecipeStatus implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Defines the enumeration set that is used to classify a record into acategory of batch history information.
"""
type RecordSet implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Provides further history record classification under the category of ControlRecipe.
"""
type RecordSetControlRecipe implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Provides further history record classification under the category of MasterRecipe.
"""
type RecordSetMasterRecipe implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Provides further history record classification under the category of ExecutionInfo.
"""
type RecordSetExecutionInfo implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Provides further history record classification under the category of MaterialInfo.
"""
type RecordSetMaterialInfo implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Provides further history record classification under the category of ContinuousData.
"""
type RecordSetContinuousData implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Provides further history record classification under the category of  Events.
"""
type RecordSetEvents implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Provides further history record classification under the category of OperatorChange.
"""
type RecordSetOperatorChange implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Provides further history record classification under the category of OperatorComment.
"""
type RecordSetOperatorComment implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Provides further history record classification under the category of AnalysisData.
"""
type RecordSetAnalysisData implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Provides further history record classification under the category of LateRecord.
"""
type RecordSetLateRecord implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Provides further history record classification under the category of RecipeData.
"""
type RecordSetRecipeData implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Provides further history record classification under the category of RecipeSpecified.
"""
type RecordSetRecipeSpecified implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Provides further history record classification under the category of SummaryData.
"""
type RecordSetSummaryData implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Defines the intended action of the schedule record.
"""
type ScheduleAction implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Defines the mode in which the schedule record begins execution.
"""
type ScheduleMode implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Defines the possible status of a schedule.
"""
type ScheduleStatus implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Defines the type of entity in a schedule record.
"""
type SE_Type implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Defines the data type of an associated data value.
"""
type ValueDataType implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}

"""
Defines how a value string is interpreted.
"""
type ValueType implements EnumerationValue {
"""
Identifies the name of the enumeration set.
"""
enumSet : EnumerationSet
"""
Specifies the numerical value associated with the enumeration member.
"""
enumValue : String
"""
Defines the associated text for the enumeration member.
"""
enumString : String
"""
Contains the use of the enumeration member.  (Provided to assist in the translation of the TextString.)
"""
description: String
}`,
      version: '1',
      date: new Date('2023-04-03'),
    },
  ],
};
