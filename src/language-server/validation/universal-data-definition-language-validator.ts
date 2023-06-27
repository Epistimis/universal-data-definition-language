import { ValidationChecks, ValidationRegistry } from 'langium';
import { UniversalDataDefinitionLanguageAstType} from '../generated/ast';
import type { UniversalDataDefinitionLanguageServices } from '../universal-data-definition-language-module';
import { checkElementHasUniqueName } from './dataModel';
import { checkNameIsValidIdentifier, checkNameIsReservedWord, checkIsDescriptionEmpty } from './uddlElement';
import { checkForUniqueID, checkForCyclesInSpecialization, checkObservableComposedOnce, checkForAtLeastOneLocalConceptualCharacteristic, checkForAtLeastTwoParticipants, checkCharacteristicsHaveUniqueRolenames, checkSpecializingConceptualCharacteristicsConsistent  } from './conceptualDataModel/conceptualEntityAndConceptualAssociation';
import { checkLowerBoundValid, checkUpperBoundValid, checkLowerBound_LTE_UpperBound, checkRolenameIsValidIdentifier } from './conceptualDataModel/conceptualCharacteristic';

/**
 * Registry for validation checks.
 */
export class UniversalDataDefinitionLanguageValidationRegistry extends ValidationRegistry {
    constructor(services: UniversalDataDefinitionLanguageServices) {
        super(services);     
        const validator = services.validation.UniversalDataDefinitionLanguageValidator;
        const checks: ValidationChecks<UniversalDataDefinitionLanguageAstType> = {
            ConceptualEntity:[validator.checkForUniqueID, validator.checkForCyclesInSpecialization, validator.checkObservableComposedOnce,
                              validator.checkForAtLeastOneLocalConceptualCharacteristic, validator.checkCharacteristicsHaveUniqueRolenames, 
                              validator.checkSpecializingConceptualCharacteristicsConsistent],
            ConceptualAssociation: [validator.checkForAtLeastOneLocalConceptualCharacteristic, validator.checkForAtLeastTwoParticipants],
            UddlElement: [validator.checkNameIsValidIdentifier, validator.checkNameIsReservedWord, validator.checkIsDescriptionEmpty],
            DataModel: validator.checkElementHasUniqueName,
            ConceptualCharacteristic: [ validator.checkLowerBoundValid,  validator.checkUpperBoundValid, validator.checkLowerBound_LTE_UpperBound, 
                                        validator.checkRolenameIsValidIdentifier]
        };
        this.register(checks, validator);
    }
}

/**
 * All validation functions are using a separate helper function, 
 * as the main validator function is not allowed to return any value, it will require an extra throw error call, for testing purpose. 
 * extra helper function with return value saves that.
 */

/**
* Implementation of custom validations. All validations are from UDDL java OCL files.
*/
export  class UniversalDataDefinitionLanguageValidator {
    /**datamodel */
    checkElementHasUniqueName = checkElementHasUniqueName
    
    /**uddlelement */
    checkNameIsValidIdentifier = checkNameIsValidIdentifier
    checkNameIsReservedWord = checkNameIsReservedWord
    checkIsDescriptionEmpty = checkIsDescriptionEmpty 

    /**conceptualAssociation */
    checkForAtLeastTwoParticipants = checkForAtLeastTwoParticipants

    /**conceptualEntity */
    checkForUniqueID = checkForUniqueID
    checkForCyclesInSpecialization = checkForCyclesInSpecialization
    checkObservableComposedOnce = checkObservableComposedOnce
    checkForAtLeastOneLocalConceptualCharacteristic = checkForAtLeastOneLocalConceptualCharacteristic
    checkCharacteristicsHaveUniqueRolenames = checkCharacteristicsHaveUniqueRolenames
    checkSpecializingConceptualCharacteristicsConsistent = checkSpecializingConceptualCharacteristicsConsistent

    /**conceptualCharacteristic */
    checkLowerBoundValid = checkLowerBoundValid
    checkUpperBoundValid = checkUpperBoundValid
    checkLowerBound_LTE_UpperBound = checkLowerBound_LTE_UpperBound
    checkRolenameIsValidIdentifier = checkRolenameIsValidIdentifier

}







