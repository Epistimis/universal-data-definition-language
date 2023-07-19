import { ValidationAcceptor } from "langium";
import { ConceptualCharacteristic, ConceptualComposableElement, isConceptualComposition, isConceptualParticipant } from "../../generated/ast";
import { isValidIdentifier } from "../uddlElement";
import { getIdentityContributionOfComposition } from "./conceptualComposition";
import { getIdentityContributionOfParticipents } from "./conceptualParitipants";

/* 
* Helper method that gets the contribution a ConceptualCharacteristic makes
* to a ConceptualEntity's uniqueness.
*/ 
export const getIdentityContribution = (model: ConceptualCharacteristic):{type:ConceptualComposableElement| undefined, lowerBound: number|undefined, upperBound:number|undefined} =>{
    let result
    if(isConceptualComposition(model)){
        result = getIdentityContributionOfComposition(model);
    }else if(isConceptualParticipant(model)){
        result = getIdentityContributionOfParticipents(model)
    }
    return result;
}

/**
 * A ConceptualCharacteristic's lowerBound is less than or equal to its upperBound, unless its upperBound is -1.
 * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
 * invariant lowerBound_LTE_UpperBound
 */
export const checkLowerBound_LTE_UpperBound = (model: ConceptualCharacteristic, accept: ValidationAcceptor) => {
    if (!lowerBound_LTE_UpperBound(model)) {
        accept('error', "A ConceptualCharacteristic's lowerBound is less than or equal to its upperBound, unless its upperBound is -1", { node: model, property: "lowerBound" });
    }
}

export const lowerBound_LTE_UpperBound = (model: ConceptualCharacteristic): boolean => {   
    return model.upperBound !== -1 ? model.lowerBound! <= model.upperBound! : lowerBoundValid(model);  
}

/**
 * A ConceptualCharacteristic's upperBound is equal to -1 or greater than 1.
 * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
 * invariant upperBoundValid
 */
export const checkUpperBoundValid = (model: ConceptualCharacteristic, accept: ValidationAcceptor) => {
    if (!upperBoundValid(model)) {
        accept('error', "A ConceptualCharacteristic's upperBound is equal to -1 or greater than 1", { node: model, property: "upperBound" });
    }
}

export const upperBoundValid = (model: ConceptualCharacteristic): boolean => {
    if (model.upperBound) {
        return model.upperBound === -1 || model.upperBound >= 1;
    }
    return false;
}

/**
 * A ConceptualCharacteristic's lowerBound is greater than or equal to zero.
 * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
 * invariant lowerBoundValid
 */
export const checkLowerBoundValid = (model: ConceptualCharacteristic, accept: ValidationAcceptor) => {
    if (!lowerBoundValid(model)) {
        accept('error', "A ConceptualCharacteristic's lowerBound is greater than or equal to zero", { node: model, property: "lowerBound" });
    }
}

export const lowerBoundValid = (model: ConceptualCharacteristic): boolean => {
    if (model.lowerBound) {
        return model.lowerBound >= 0;
    }
    return false;
}

/**
 * The rolename of a ConceptualCharacteristic is a valid identifier.
 * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
 * invariant rolenameIsValidIdentifier
 */
export const checkRolenameIsValidIdentifier = (model: ConceptualCharacteristic, accept: ValidationAcceptor) => {
    if (!isValidIdentifier(model.rolename)) {
        accept('error', "The rolename of a ConceptualCharacteristic should be a valid identifier", { node: model, property: "rolename" }); 
    } 
}
