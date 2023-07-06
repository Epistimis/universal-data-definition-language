import { ValidationAcceptor } from "langium";
import { ConceptualCharacteristic, ConceptualParticipant, ConceptualPathNode, DataModel, isConceptualCharacteristicPathNode, isConceptualEntity, isConceptualParticipant, isConceptualPathNode} from "../../generated/ast";
import { getProjectedCharacteristic } from "./conceptualPathNode";
import { getNodeType } from "./conceptualPathNode";
import { isSpecializationOf } from "./conceptualComposition";
import { getType } from "./conceptualCharacteristic";
/**
 * Helper method that gets a ConceptualParticipant's ConceptualPathNode sequence.
 */
export const getPathSequence = (model: ConceptualParticipant)=> {
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
export const getRolename = (model: ConceptualParticipant | ConceptualCharacteristic):boolean=>{
    let result = false;
    if(model.rolename){
        result = true;
        return result;
    }else if(isConceptualParticipant(model) && model.path){
        let conceptualpathnode = getPathSequence(model);
        let cpn = conceptualpathnode[conceptualpathnode.length - 1];
        if(isConceptualCharacteristicPathNode(cpn) && cpn.projectedCharacteristic?.ref){
        result = getRolename(cpn.projectedCharacteristic?.ref);
        }
    }
    return result;
}

/*
* Helper method that determines if a ConceptualParticipant's
* path sequence contains a cycle.
*/
export const hasCycleInPath = (model: ConceptualParticipant)=>{
    let path = getPathSequence(model);
    let projectedchar = path.map(item =>{
        return getProjectedCharacteristic(item);
    })
    return projectedchar.includes(model);
}

/*
* Helper method that gets the element projected by a ConceptualParticipant.
* Returns a ConceptualComposableElement.
*/
export const getResolvedType = (model: ConceptualParticipant, dataModel : DataModel) =>{
    if(model.path){
        if(!hasCycleInPath(model)){
            const path = getPathSequence(model);
            const lastitem = path[path.length - 1];
            return getNodeType(lastitem, dataModel)
        }
    }
    return model.type.ref;
}

/*
* Helper method that determines if a ConceptualParticipant's path sequence is "equal" to another path sequence. 
* (A ConceptualPathNode sequence "A" is "equal" a sequence "B" if the projected element of each ConceptualPathNode in A is the same
* projected element of the corresponding ConceptualPathNode in B.)
*/
export const pathIsEqualTo = (specparticipant: ConceptualParticipant, participant: ConceptualParticipant):boolean => {
    let patseq = getPathSequence(participant);
    let specpathseq = getPathSequence(specparticipant);
    return  patseq.length === specpathseq.length &&
            patseq.every(pathnode => {
                return  specpathseq.every(specpathnode =>{
                           let prochar = getProjectedCharacteristic(pathnode);
                           let specprochar = getProjectedCharacteristic(specpathnode);
                           return prochar === specprochar;
                        })
            })
}

/*
* Helper method that determines if a ConceptualParticipant's path sequence correctly "specializes" another path sequence.
* (A ConceptualPathNode sequence "A" "specializes" a sequence "B" if the projected element of each ConceptualPathNode in A specializes the
* projected element of the corresponding ConceptualPathNode in B.)
*/
export const pathIsSpecializationOf = (specparticipant: ConceptualParticipant, participant: ConceptualParticipant):boolean => {
    let patseq = getPathSequence(participant);
    let specpathseq = getPathSequence(specparticipant);

    return  patseq.length > 0 && patseq.length === specpathseq.length &&
            patseq.every(pathnode => {
                return  specpathseq.every(specpathnode =>{
                    let prochar = getProjectedCharacteristic(pathnode);
                    let specprochar = getProjectedCharacteristic(specpathnode);
                    if(isConceptualEntity(specprochar?.type.ref!) && isConceptualEntity(prochar?.type.ref)){
                       return isSpecializationOf(specprochar?.type.ref!, prochar?.type.ref!)
                    }  
                })
    })
}

/*
* A ConceptualParticipant has a rolename, either projected from a. characteristic or defined directly on the ConceptualParticipant.
* UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
* Invariant rolenameDefined
*/
export const checkRollnameDefined = (model: ConceptualParticipant, accept: ValidationAcceptor)=>{
    if(getRolename(model)){
        accept('error', "ConceptualParticipant's rolename must be defined", { node: model, property: "rolename" });
    }
}

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
export const isMultiplicityConsistentWithSpecialization = (model: ConceptualParticipant):boolean =>{
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
    return false
}

/*
* If a ConceptualParticipant specializes, its type, ConceptualPathNode sequence, or multiplicity is different from the ConceptualParticipant it specializes.
* UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl 
* Invariant specializationDistinct
*/
export const checkSpecializationDistinct = (model: ConceptualParticipant, datamodel: DataModel,  accept: ValidationAcceptor) => {
    if(specializationDistinct(model, datamodel)){
        accept('error', "specialization must be distinct", { node: model, property: "specializes" });
    }
}
export const specializationDistinct = (model: ConceptualParticipant, datamodel: DataModel): boolean => {
    
    if(model.specializes?.ref && isConceptualParticipant(model.specializes?.ref)){
            let specializedParticipant = model.specializes?.ref;
            return model.type.ref !== getType(model.specializes.ref, datamodel) ||
                   pathIsSpecializationOf(specializedParticipant, model) ||
                   model.lowerBound !== model.specializes.ref.lowerBound ||
                   model.upperBound !== model.specializes.ref.upperBound ||
                   model.sourceLowerBound !==  specializedParticipant.sourceLowerBound ||
                   model.sourceUpperBound !== specializedParticipant.sourceUpperBound
    }
    return false
}