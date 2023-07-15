import { ValidationAcceptor } from "langium";
import {  ConceptualAssociation, ConceptualCharacteristic, ConceptualComposableElement, ConceptualEntity, ConceptualParticipant, ConceptualPathNode, DataModel, isConceptualAssociation, isConceptualCharacteristic, isConceptualCharacteristicPathNode, isConceptualEntity, isConceptualParticipant, isConceptualParticipantPathNode } from "../../generated/ast";
import { getType } from "./conceptualCharacteristic";
import { getAllCharacteristics } from "./conceptualEntityAndConceptualAssociation";


/*
* Helper method that gets the ConceptualCharacteristic projected by a ConceptualPathNode.
*/
export const getProjectedCharacteristic = (path: ConceptualPathNode): ConceptualCharacteristic | ConceptualParticipant=>{
   let result;
    if(isConceptualCharacteristicPathNode(path)){
       result = path.projectedCharacteristic.ref;
    }else if(isConceptualParticipantPathNode(path)){
       result = path.projectedParticipant.ref;
    }
    return result!;
}

/*
* Helper method that gets the "node type" of a ConceptualPathNode. For a ConceptualCharacteristicPathNode, the node type is the type of the projected
* characteristic. For a ConceptualParticipantPathNode, the node type is the ConceptualAssociation containing the projected ConceptualParticipant.
* Returns a ConceptualComposableElement.
*/
export const getNodeType = (path: ConceptualPathNode, datamodel: DataModel) : ConceptualComposableElement=>{
   let result
     if(isConceptualCharacteristicPathNode(path)){
        result = getType(path.projectedCharacteristic.ref!, datamodel);
     }else if(isConceptualParticipantPathNode(path)){
         let conassoc = getAllConceptualAssociation(datamodel);
         conassoc = conassoc.filter( assoc =>{
            assoc.participant.includes(path.projectedParticipant.ref!)
         })
         result = conassoc[0]
     } 
     return result!; 
}
//get all instances of conceptual association
const getAllConceptualAssociation = ( model: DataModel)=>{
   let allconassoc: ConceptualAssociation[] = []
   model.cdm.forEach(cdm =>{
      cdm.element.forEach(elm =>{
         if(isConceptualAssociation(elm)){
            allconassoc.push(elm)
         }
      })
   })
   return allconassoc;
}

    
/*
* Helper method that determines if a ConceptualPathNode projects a ConceptualParticipant.
*/  
export const projectsParticipant = (path: ConceptualPathNode):boolean =>{
   return isConceptualCharacteristicPathNode(path) && isConceptualParticipant(path.projectedCharacteristic);     
}
          
/*
* Helper method that gets the ConceptualParticipant projected by a ConceptualPathNode. Returns null if no ConceptualParticipant is projected.
*/  
export const projectedParticipant = (path: ConceptualPathNode): ConceptualParticipant | null =>{
     return isConceptualCharacteristicPathNode(path) && isConceptualParticipant(path.projectedCharacteristic) ?
            path.projectedCharacteristic : null;
}
      
/*
* Helper method that determines if a ConceptualPathNode is resolvable from a given ConceptualEntity.
*/
export const isResolvableFromConceptualEntity = (entity: ConceptualEntity, path: ConceptualPathNode): boolean=>{
   let allchar = getAllCharacteristics(entity)
   if(isConceptualCharacteristicPathNode(path)){
      return allchar.every(item =>{
                      return path.projectedCharacteristic.ref?.rolename === item.rolename
                     });
    }else{
      return path.projectedParticipant.ref?.type.ref?.name === entity.name  
    }
}

// TODO: find out the reason for inconsistency in the comment vs. the code.
/*
* Helper method that determines if the resolved characteristic has a multiplicity with upper bound greater than 1.
*/
export const projectsAcrossCollection = (path: ConceptualPathNode) : boolean =>{
   let result = false;
    if(isConceptualCharacteristicPathNode(path)){
      let projectedchar = path.projectedCharacteristic.ref;
      if(isConceptualCharacteristic(projectedchar) && projectedchar.upperBound && projectedchar.lowerBound) 
         result = projectedchar.upperBound !== 1 || projectedchar.lowerBound !== 1
       
    }else{
      let projectedpar = path.projectedParticipant.ref;
      if(projectedpar?.sourceUpperBound && projectedpar.rolename) 
         result = projectedpar?.sourceUpperBound !== 1 || projectedpar.sourceLowerBound !== 1
    }
    return result;
}

/*
* If a ConceptualCharacteristicPathNode projects a ConceptualCharacteristic with upper or
* lower bounds not equal to 1, then it is the end of a ConceptualPathNode sequence.
* If a ConceptualParticipantPathNode projects a ConceptualParticipant with source lower or
* upper bounds not equal to 1, then it is the end of a ConceptualPathNode sequence.
* UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
* Invariant noProjectionAcrossCollection
*/
export const checkNoProjectionAcrossCollection = (path: ConceptualPathNode, accept: ValidationAcceptor) =>{
   if(noProjectionAcrossCollection(path)){
      accept('error', "No Projection Across Collection ", { node: path, property:"node" });
   }
}
const noProjectionAcrossCollection = (path: ConceptualPathNode): boolean =>{
   let result = false;
   if(projectsAcrossCollection(path)){
       result = path.node === null
   }
   return result;
}

/*
* If a ConceptualPathNode "A" is not the last in a path sequence, the next ConceptualPathNode
* in the sequence is resolvable from the "node type" of A.
* UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
* Invariant pathNodeResolvable
*/
export const checkPathNodeResolvable = (path: ConceptualPathNode, datamodel: DataModel, accept: ValidationAcceptor) =>{
   if(!pathNodeResolvable(path, datamodel)){
      accept('error', "Path Node should be Resolvable", { node: path, property:"node" });
   }
}

export const pathNodeResolvable = (path: ConceptualPathNode, datamodel: DataModel): boolean =>{
   let result = false
   if(path.node){
      let nodetype = getNodeType(path, datamodel)
      if(nodetype){
         result = isConceptualEntity(nodetype) && isResolvableFromConceptualEntity(nodetype, path.node)
      }
   }
   return result;
}