import { ValidationAcceptor, ValidationChecks, ValidationRegistry } from 'langium';
//import { resourceLimits } from 'worker_threads';
import { UniversalDataDefinitionLanguageAstType, ConceptualEntity, ConceptualCharacteristic } from './generated/ast';
import type { UniversalDataDefinitionLanguageServices } from './universal-data-definition-language-module';

/**
 * Registry for validation checks.
 */
export class UniversalDataDefinitionLanguageValidationRegistry extends ValidationRegistry {
    constructor(services: UniversalDataDefinitionLanguageServices) {
        super(services);
        const validator = services.validation.UniversalDataDefinitionLanguageValidator;
        const checks: ValidationChecks<UniversalDataDefinitionLanguageAstType> = {
            ConceptualEntity: validator.checkEntityHasAtLeast2Characteristics,
        };
        this.register(checks, validator);
    }
}

/**
 * Implementation of custom validations.
 */
export class UniversalDataDefinitionLanguageValidator {

    checkEntityHasAtLeast2Characteristics(entity: ConceptualEntity, accept: ValidationAcceptor): void {

        const result = this.getEntityCharacteristics(entity);
        if (result.length < 2) {
            accept('error', 'Entity should have at least 2 characteristics.', { node: entity, property: 'composition' });
        }
    }

    getEntityCharacteristics(entity: ConceptualEntity): ConceptualCharacteristic[] {
        var result:ConceptualCharacteristic[] = [];
        const spec = entity.specializes?.ref;
        if (spec !== undefined) {
            result.concat(this.getEntityCharacteristics(spec));
        }
        // No matter what, check this entity
        result.concat(entity.composition);
        return result;
    }

}
