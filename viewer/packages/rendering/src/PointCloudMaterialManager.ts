/*!
 * Copyright 2022 Cognite AS
 */

import { PointCloudMaterial } from "./pointcloud-rendering";
import { PointCloudMaterialParameters} from "./render-passes/types";

export class PointCloudMaterialManager {
    private modelsMaterialsMap: Map<symbol, PointCloudMaterial> = new Map();

    addModelMaterial(modelIdentifier: symbol): void {
        this.modelsMaterialsMap.set(modelIdentifier, new PointCloudMaterial());
    }

    removeModelMaterial(modelIdentifier: symbol): void {
        const material = this.modelsMaterialsMap.get(modelIdentifier);

        if (material) {
            material.dispose();
        } else {
            throw new Error(`Model identifier: ${modelIdentifier.toString} not found`);  
        }

        this.modelsMaterialsMap.delete(modelIdentifier);
    }

    getModelMaterial(modelIdentifier: symbol): PointCloudMaterial {
        const material = this.modelsMaterialsMap.get(modelIdentifier);
        if (material === undefined) {
            throw new Error(`Model ${modelIdentifier.toString} has not been added to PointCloudMaterialManager`);
        }

        return material;
    }

    setModelsMaterialParameters(materialParameters: PointCloudMaterialParameters | undefined) {
        if (materialParameters) {
            this.modelsMaterialsMap.forEach(material => {
                this.setMaterialParameters(material, materialParameters);
            });
        }
    }
    
    setMaterialParameters(material: PointCloudMaterial, parameters: PointCloudMaterialParameters): void {
        for (const prop of Object.entries(parameters)) {
            try {
                //@ts-ignore
                material[prop[0]] = prop[1];
            } catch {
                console.error(`Undefined point cloud material property: ${prop[0]}`);
            }
        }
    }

    dispose() {
        this.modelsMaterialsMap.forEach(material => {
            material.dispose();
        });
        this.modelsMaterialsMap.clear();
    }
}
