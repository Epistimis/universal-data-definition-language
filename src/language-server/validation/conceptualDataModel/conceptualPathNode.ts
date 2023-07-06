import { ValidationAcceptor } from "langium";
import {  ConceptualAssociation, ConceptualComposableElement, ConceptualPathNode, DataModel, isConceptualAssociation, isConceptualCharacteristicPathNode, isConceptualParticipantPathNode } from "../../generated/ast";
import { getType } from "./conceptualCharacteristic";


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