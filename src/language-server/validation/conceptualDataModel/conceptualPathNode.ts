import { ValidationAcceptor } from "langium";
import {  ConceptualAssociation, ConceptualComposableElement, ConceptualEntity, ConceptualPathNode, DataModel, isConceptualAssociation, isConceptualCharacteristic, isConceptualCharacteristicPathNode, isConceptualEntity, isConceptualParticipant, isConceptualParticipantPathNode } from "../../generated/ast";
import { getType } from "./conceptualCharacteristic";
import { getAllCharacteristics } from "./conceptualEntityAndConceptualAssociation";


/*
* Helper method that gets the ConceptualCharacteristic projected by a ConceptualPathNode.
*/
export const getProjectedCharacteristic = (model: ConceptualPathNode) =>{
    if(isConceptualCharacteristicPathNode(model)){
       return model.projectedCharacteristic.ref;
    }else if(isConceptualParticipantPathNode(model)){
       return model.projectedParticipant.ref;
    }
}

/*
* Helper method that gets the "node type" of a ConceptualPathNode. For a ConceptualCharacteristicPathNode, the node type is the type of the projected
* characteristic. For a ConceptualParticipantPathNode, the node type is the ConceptualAssociation containing the projected ConceptualParticipant.
* Returns a ConceptualComposableElement.
*/
export const getNodeType = (model: ConceptualPathNode, datamodel: DataModel) : ConceptualComposableElement=>{
   let result
     if(isConceptualCharacteristicPathNode(model)){
        result = getType(model.projectedCharacteristic.ref!, datamodel);
     }else if(isConceptualParticipantPathNode(model)){
         let conassoc = getcsos(datamodel);
         conassoc = conassoc.filter( assoc =>{
            assoc.participant.includes(model.projectedParticipant.ref!)
         })
         result = conassoc[0]
     } 
     return result!; 
}
//get all instances of conceptual association
const getcsos = ( model: DataModel)=>{
   let allconassoc: ConceptualAssociation[] = []
   model.cdm.forEach(mod =>{
      mod.element.forEach(elm =>{
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
export const projectsParticipant = (model: ConceptualPathNode):boolean =>{
   return isConceptualCharacteristicPathNode(model) && isConceptualParticipant(model.projectedCharacteristic);     
}
          
/*
* Helper method that gets the ConceptualParticipant projected by a ConceptualPathNode. Returns null if no ConceptualParticipant is projected.
*/  
export const projectedParticipant = (model: ConceptualPathNode) =>{
     return isConceptualCharacteristicPathNode(model) && isConceptualParticipant(model.projectedCharacteristic) ?
            model.projectedCharacteristic : null;
}
      
/*
* Helper method that determines if a ConceptualPathNode is resolvable from a given ConceptualEntity.
*/
export const isResolvableFromConceptualEntity = (entity: ConceptualEntity, model: ConceptualPathNode)=>{
   let allchar = getAllCharacteristics(entity)
   if(isConceptualCharacteristicPathNode(model)){
      return allchar.find(item =>{
                      return model.projectedCharacteristic.ref?.rolename === item.rolename
                     });
    }else{
      return model.projectedParticipant.ref?.type.ref?.name === entity.name  
    }
}

/*
* Helper method that determines if the resolved characteristic has a multiplicity with upper bound greater than 1.
*/
export const projectsAcrossCollection = (model: ConceptualPathNode)=>{
    if(isConceptualCharacteristicPathNode(model)){
      let projectedchar = model.projectedCharacteristic.ref;
      if(isConceptualCharacteristic(projectedchar) && projectedchar.upperBound && projectedchar.lowerBound) 
         return projectedchar.upperBound !== 1 || projectedchar.lowerBound !== 1
       
    }else{
      let projectedpar = model.projectedParticipant.ref;
      if(projectedpar?.sourceUpperBound && projectedpar.rolename) 
         return projectedpar?.sourceUpperBound !== 1 || projectedpar.sourceLowerBound !== 1
    }
}

/*
* If a ConceptualCharacteristicPathNode projects a ConceptualCharacteristic with upper or
* lower bounds not equal to 1, then it is the end of a ConceptualPathNode sequence.
* If a ConceptualParticipantPathNode projects a ConceptualParticipant with source lower or
* upper bounds not equal to 1, then it is the end of a ConceptualPathNode sequence.
*
* Invariant noProjectionAcrossCollection
*/
export const checkNoProjectionAcrossCollection = (model: ConceptualPathNode, accept: ValidationAcceptor) =>{
   if(noProjectionAcrossCollection(model)){
      accept('error', "No Projection Across Collection ", { node: model, property:"node" });
   }
}
const noProjectionAcrossCollection = (model: ConceptualPathNode) =>{
   if(projectsAcrossCollection(model)){
       return model.node === null
   }
}

/*
* If a ConceptualPathNode "A" is not the last in a path sequence, the next ConceptualPathNode
* in the sequence is resolvable from the "node type" of A.
* 
* Invariant pathNodeResolvable
*/
export const checkPathNodeResolvable = (model: ConceptualPathNode,datamodel: DataModel, accept: ValidationAcceptor) =>{
   if(pathNodeResolvable(model, datamodel)){
      accept('error', "Path Node should be Resolvable", { node: model, property:"node" });
   }
}

const pathNodeResolvable = (model: ConceptualPathNode, datamodel: DataModel) =>{
   if(model.node){
      let nodetype = getNodeType(model, datamodel)
      if(nodetype){
         return isConceptualEntity(nodetype) && isResolvableFromConceptualEntity(nodetype, model.node)
      }else{
         return false;
      }
   }
}