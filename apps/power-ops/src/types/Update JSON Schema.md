# How to update JSON Schema for WorkflowSchemaWithProcesses type?

First you need to empty the `compilerOptions.types` array from the [tsconfig.json](../../tsconfig.json#L7) file.
Then you can just run the script `yarn update-json-schema` saved in the [package.json](../../package.json#L24) file to have the file updated in the folder.
