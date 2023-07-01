 import { ValidationAcceptor } from "langium";
 import * as element from "../generated/ast";
 
 /**
  * reserved words array
  */
const reservedWordsArray = ['abstract','alias','any','attribute' ,'bitfield' ,'bitmask' ,'bitset' ,'boolean' ,'case' ,'char' ,'component' ,'connector' ,'const' ,'consumes' ,'context' ,'custom' ,'default','double' ,'emits' ,'enum' ,'eventtype' ,'exception' ,'factory' ,'false','finder' ,'fixed' ,'float' ,'getraises' ,'home' ,'import','in' ,'inout' ,'interface','local' ,'long' ,'manages' ,'map' ,'mirrorport' ,'module' ,'multiple' ,'native','object' ,'octet','oneway' ,'out' ,'port' ,'porttype' ,'primarykey' ,'private' ,'provides' ,'public' ,'publishes' ,'raises' ,'readonly' ,'sequence' , 'setraises' ,'short' ,'string' ,'struct' ,'supports','switch','true' ,'truncatable','typedef','typeid' ,'typename' ,'typeprefix','union','unsigned','uses','valuebase','valuetype','void','wchar','wstring']
 
 /** 
  * The name of an Element is a valid identifier. 
  * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/uddl.ocl
  * invariant nameIsValidIdentifier
*/
export const checkNameIsValidIdentifier = (model: element.UddlElement, accept: ValidationAcceptor) =>{  
    if(model?.name){
        if(!isValidIdentifier(model.name)){
            accept('error', "This element name must not contain any special character, it should be alphanumeric.", {node: model, property: "name" });       
        }
    }
}
export const isValidIdentifier = (name: string) =>{
    if(name.match(/^[a-zA-Z0-9]+$/) === null){
       return false;
    }
    return true;
}

/** 
* A DataModel's name is not an IDL reserved word,(CR 242).
* UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/datamodel.ocl
* invariant nameIsNotReservedWord
*/
export const checkNameIsReservedWord = (model: element.UddlElement, accept: ValidationAcceptor) =>{  
    if(model?.name){
        if(isReservedWord(model.name)){
            accept('error', "Reserved words can not be assigned as element's Name.", {node: model, property: "name" });       
        }
    }
}
export const isReservedWord = (name: string) =>{
    if(reservedWordsArray.includes(name.toLocaleLowerCase())){
        return true;
    }
    return false;
}


   /**
     * Elements have a non-empty description.
     * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/uddl.ocl
     * invariant nonEmptyDescription
     */
   export const checkIsDescriptionEmpty = (element: element.ConceptualObservable | element.LogicalUnit | element.LogicalLandmark | element.LogicalReferencePoint | 
    element.LogicalMeasurementSystem | element.LogicalMeasurementSystemAxis | element.LogicalCoordinateSystem | element.LogicalCoordinateSystemAxis | 
    element.LogicalMeasurementSystemConversion | element.LogicalBoolean | element.LogicalCharacter | element.LogicalNumeric | element.LogicalInteger | 
    element.LogicalNatural | element.LogicalNonNegativeReal | element.LogicalReal | element.LogicalString, accept:ValidationAcceptor) =>{
   
    if(isDescriptionEmpty(element?.description)){
        accept('error', 'This element must have a Description.', {node : element, property : "description" });
    }
}
export const isDescriptionEmpty = (des: string | undefined):boolean =>{
    return des === undefined || des!.trim().length === 0
}