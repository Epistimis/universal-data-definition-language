import { ValidationAcceptor } from "langium";
import { ConceptualCharacteristic, ConceptualComposableElement, ConceptualComposition, ConceptualEntity, ConceptualParticipant, ConceptualPathNode, DataModel, isConceptualCharacteristicPathNode, isConceptualComposableElement, isConceptualEntity, isConceptualParticipant, isConceptualPathNode} from "../../generated/ast";
import { getNodeType, getProjectedCharacteristic } from "./conceptualPathNode";
import { isSpecializationOf } from "./conceptualComposition";
import { getType } from "./conceptualCharacteristic";

/**
 * Helper method that gets a ConceptualParticipant's ConceptualPathNode sequence.
 */
export const getPathSequence = (model: ConceptualParticipant): ConceptualPathNode[] =>{
    const pathSequence = new Set<ConceptualPathNode>();
    if(model.path){
        traverse(model.path, pathSequence);
        pathSequence.add(model.path);
    }
    return Array.from(pathSequence);
}
//collect all paths
export const traverse = (model: ConceptualPathNode, sequence : Set<ConceptualPathNode>) => {
    if('projectedParticipant' in model){
        if(model.projectedParticipant.ref?.path && model.node){
            sequence.add(model.projectedParticipant.ref.path);
            sequence.add(model.node);
        }
    }
    sequence.forEach(item => {
        if (isConceptualPathNode(item)) {
            traverse(item, sequence);
        }
    });
}

/*
* Helper method that gets the rolename of a ConceptualParticipant.(A ConceptualParticipant's rolename is either projected from a
* characteristic or defined directly on the ConceptualParticipant.)
*/
export const getRolename = (model: ConceptualParticipant | ConceptualCharacteristic): string | undefined => {
    if(model.rolename){
        return model.rolename;
    }else if(isConceptualParticipant(model) && model.path){
        let conceptualPathnode = getPathSequence(model);
        let lastPathnode = conceptualPathnode[conceptualPathnode.length - 1];
        if(isConceptualCharacteristicPathNode(lastPathnode) && lastPathnode.projectedCharacteristic?.ref){
            return getRolename(lastPathnode.projectedCharacteristic?.ref);
        }
    }
}

/*
* Helper method that determines if a ConceptualParticipant's path sequence contains a cycle.
*/
export const hasCycleInPath = (model: ConceptualParticipant): boolean => {
    let path = getPathSequence(model);
    let projectedCharacteristic = path.map(item =>{
        return getProjectedCharacteristic(item);
    });
    return projectedCharacteristic.includes(model);
}

/*
* Helper method that gets the element projected by a ConceptualParticipant. Returns a ConceptualComposableElement.
*/
export const getResolvedType = (model: ConceptualParticipant, dataModel : DataModel): ConceptualComposableElement => {
    let result 
    if(model.path){
        if(!hasCycleInPath(model)){
            const path = getPathSequence(model);
            const lastPath = path[path.length - 1];
            result = getNodeType(lastPath, dataModel);
        }
    }else{
        if(isConceptualComposableElement(model.type.ref))
           result = model.type.ref;
    }
    return result as ConceptualComposableElement;
}

/*
* Helper method that determines if a ConceptualParticipant's path sequence is "equal" to another path sequence. 
* (A ConceptualPathNode sequence "A" is "equal" a sequence "B" if the projected element of each ConceptualPathNode in A is the same
* projected element of the corresponding ConceptualPathNode in B.)
*/
export const pathIsEqualTo = (specParticipant: ConceptualParticipant, participant: ConceptualParticipant): boolean => {
    let pathSeq = getPathSequence(participant);
    let specPathSeq = getPathSequence(specParticipant);
    return  pathSeq.length === specPathSeq.length &&
            pathSeq.every((pathNode, index) => {
                           let projectedChar = getProjectedCharacteristic(pathNode);
                           let specProjectedChar = getProjectedCharacteristic(specPathSeq[index]);
                           return projectedChar === specProjectedChar;
            });
}

/*
* Helper method that determines if a ConceptualParticipant's path sequence correctly "specializes" another path sequence.
* (A ConceptualPathNode sequence "A" "specializes" a sequence "B" if the projected element of each ConceptualPathNode in A specializes the
* projected element of the corresponding ConceptualPathNode in B.)
*/
export const pathIsSpecializationOf = (specParticipant: ConceptualParticipant, participant: ConceptualParticipant): boolean => {
    let pathSeq = getPathSequence(participant);
    let specPathSeq = getPathSequence(specParticipant);

    return  pathSeq.length > 0 && pathSeq.length === specPathSeq.length &&
            pathSeq.every((pathNode, index) => {
                    let projectedChar = getProjectedCharacteristic(pathNode);
                    let specProjectedChar = getProjectedCharacteristic(specPathSeq[index]);
                    if(isConceptualEntity(specProjectedChar?.type.ref!) && isConceptualEntity(projectedChar?.type.ref)){
                       return isSpecializationOf(specProjectedChar?.type.ref!, projectedChar?.type.ref!);
                    }
            });
}

/* 
* Helper method that gets the contribution a ConceptualComposition makes to a ConceptualEntity's uniqueness (type and multiplicity).
*/ 
export const getIdentityContributionOfComposition = (model: ConceptualParticipant): {type: ConceptualEntity | undefined,
    projectedChar: (ConceptualComposition | undefined)[],
    lowerBound: number | undefined,
   upperBound: number |undefined} =>{
    const allProjectedChar = getPathSequence(model).map(item => getProjectedCharacteristic(item))
    return {type: model.type.ref,
            projectedChar: allProjectedChar, 
            lowerBound: model.lowerBound,
            upperBound: model.upperBound}
}

/*
* A ConceptualParticipant has a rolename, either projected from a. characteristic or defined directly on the ConceptualParticipant.
* UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
* Invariant rolenameDefined
*/
export const checkRolenameDefined = (model: ConceptualParticipant, accept: ValidationAcceptor)=>{
    if(getRolename(model)){
        accept('error', "ConceptualParticipant's rolename must be defined", { node: model, property: "rolename" });
    }
}

/*
* If a ConceptualParticipant has a path sequence, the first ConceptualPathNode in the sequence
* is resolvable from the type of the ConceptualParticipant.
* UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
* Invariant pathNodeResolvable
*/
// TODO: Finish implementing isResolvableFromConceptualEntity then uncomment this
// export const checkkPathNodeResolvable = (model: ConceptualParticipant, accept: ValidationAcceptor) => {
//     if(!isPathNodeResolvable(model)){
//         accept('error', "Path node should be resolvable", { node: model, property: "path" });
//     }
// }
// export const isPathNodeResolvable = (model: ConceptualParticipant): boolean | undefined=>{
//    if(model.path){
//        return isResolvableFromConceptualEntity(model.type.ref, model.path);
//    }
// }


/*
* If a ConceptualParticipant specializes, its multiplicity is at least as restrictive as the ConceptualParticipant it specializes.
* UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl 
* Invariant multiplicityConsistentWithSpecialization
*/
export const checkMultiplicityConsistentWithSpecialization = (model: ConceptualParticipant, accept : ValidationAcceptor) =>{
    if(isMultiplicityConsistentWithSpecialization(model)){
        accept('error', "multiplicity must be consistent with specialization", { node: model, property: "specializes" });
    }
}
export const isMultiplicityConsistentWithSpecialization = (model: ConceptualParticipant): boolean => {
    let result = false;
    if(model.specializes?.ref && isConceptualParticipant(model)){
        if(model.lowerBound && model.upperBound && model.specializes.ref.lowerBound && model.specializes.ref.upperBound){
            result = model.lowerBound >= model.specializes.ref.lowerBound && 
                    model.specializes.ref.upperBound === -1 ? 
                    model.upperBound >= model.specializes.ref.upperBound :
                    model.upperBound <= model.specializes.ref.upperBound 
        }          
    }
    return result;
}

/*
* If a ConceptualParticipant specializes, it specializes a ConceptualParticipant. If ConceptualParticipant "A" specializes ConceptualParticipant "B",
* then A's type is the same or a specialization of B's type, and A's ConceptualPathNode sequence is "equal to" or "specializes" B's
* ConceptualPathNode sequence (see "pathIsEqual" and "pathIsSpecializationOf" helper methods).
* UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl 
* Invariant typeConsistentWithSpecialization
*/
export const checkTypeConsistentWithSpecialization = (model: ConceptualParticipant, accept: ValidationAcceptor) => {
    if(typeConsistentWithSpecialization(model)){
        accept('error', "type must be consistent with specialization", { node: model, property: "specializes" });
    }

}
export const typeConsistentWithSpecialization = (model: ConceptualParticipant): boolean => {

    if(model.specializes?.ref && isConceptualParticipant(model.specializes?.ref)){
        let specializedParticipant = model.specializes?.ref;
        return model.type.ref === specializedParticipant.type.ref || 
               isSpecializationOf(specializedParticipant.type.ref!, model.type.ref!) &&
               pathIsEqualTo(specializedParticipant, model) || pathIsSpecializationOf(specializedParticipant, model)
    }
    return false;
}

/*
* If a ConceptualParticipant specializes, its type, ConceptualPathNode sequence, or multiplicity is different from the ConceptualParticipant it specializes.
* UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl 
* Invariant specializationDistinct
*/
export const checkSpecializationDistinct = (model: ConceptualParticipant, dataModel: DataModel,  accept: ValidationAcceptor) => {
    if(specializationDistinct(model, dataModel)){
        accept('error', "specialization must be distinct", { node: model, property: "specializes" });
    }
}
export const specializationDistinct = (model: ConceptualParticipant, dataModel: DataModel): boolean => {
    
    if(model.specializes?.ref && isConceptualParticipant(model.specializes?.ref)){
            let specializedParticipant = model.specializes?.ref;
            return model.type.ref !== getType(model.specializes.ref, dataModel) ||
                   pathIsSpecializationOf(specializedParticipant, model) ||
                   model.lowerBound !== model.specializes.ref.lowerBound ||
                   model.upperBound !== model.specializes.ref.upperBound ||
                   model.sourceLowerBound !==  specializedParticipant.sourceLowerBound ||
                   model.sourceUpperBound !== specializedParticipant.sourceUpperBound
    }
    return false;
}