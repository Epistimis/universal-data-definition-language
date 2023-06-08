import { ValidationAcceptor, ValidationChecks, ValidationRegistry } from 'langium';
import * as element from './generated/ast';
import { UniversalDataDefinitionLanguageAstType} from './generated/ast';
import type { UniversalDataDefinitionLanguageServices } from './universal-data-definition-language-module';

/**
* Helper constants
*/
export const reservedWordsArray = ['abstract','alias','any','attribute' ,'bitfield' ,'bitmask' ,'bitset' ,'boolean' ,'case' ,'char' ,'component' ,'connector' ,'const' ,'consumes' ,'context' ,'custom' ,'default','double' ,'emits' ,'enum' ,'eventtype' ,'exception' ,'factory' ,'false','finder' ,'fixed' ,'float' ,'getraises' ,'home' ,'import','in' ,'inout' ,'interface','local' ,'long' ,'manages' ,'map' ,'mirrorport' ,'module' ,'multiple' ,'native','object' ,'octet','oneway' ,'out' ,'port' ,'porttype' ,'primarykey' ,'private' ,'provides' ,'public' ,'publishes' ,'raises' ,'readonly' ,'sequence' , 'setraises' ,'short' ,'string' ,'struct' ,'supports','switch','true' ,'truncatable','typedef','typeid' ,'typename' ,'typeprefix','union','unsigned','uses','valuebase','valuetype','void','wchar','wstring']
export const cycleInSpec= 'An ConceptualEntity can not be specialization of itself.';
export const notValidIdentifier = 'This element name must not contain any special character, it should be alphanumeric.';
export const notReservedWords = 'Reserved words can not be assigned as element"s Name.';
export const notUniqueName = 'Elements should have unique Name.';

/**
 * Registry for validation checks.
 */
export class UniversalDataDefinitionLanguageValidationRegistry extends ValidationRegistry {
    constructor(services: UniversalDataDefinitionLanguageServices) {
        super(services);     
        const validator = services.validation.UniversalDataDefinitionLanguageValidator;
        const checks: ValidationChecks<UniversalDataDefinitionLanguageAstType> = {
            ConceptualEntity:[ validator.checkEntityHasAtLeast2CharacteristicOrnoCyclesInSpecialization, validator.checkObservableComposedOnce, validator.checkHasUniqueID],
            UddlElement: validator.checkElementHasValidIdentifierOrReservedWord,
            DataModel: validator.checkElementHasUniqueName,
            ConceptualObservable: validator.nonEmptyDescription,
            ConceptualCharacteristic: [validator.checkLowerBound_LTE_UpperBound, validator.checkUpperBoundValid, validator.checkLowerBoundValid]
        };
        this.register(checks, validator);
    }
}

/**
 * Implementation of custom validations. All validations are from UDDL java OCL files.
 */
export  class UniversalDataDefinitionLanguageValidator {
    /** 
    * A DataModel's name is not an IDL reserved word,(CR 242).
    * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/datamodel.ocl
    * invariant nameIsNotReservedWord
    * The name of an Element is a valid identifier. 
    * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/uddl.ocl
    * invariant nameIsValidIdentifier
    */
    checkElementHasValidIdentifierOrReservedWord(model: element.UddlElement, accept: ValidationAcceptor){  
        if(model.name){
            let result = this.hasValidIdentifierOrReservedWord(model.name);
            if(result !== ''){
                accept('error', result, {node: model, property: "name" });       
            }
        }
    }
    hasValidIdentifierOrReservedWord(name: string) {
        if(name.match(/^[a-zA-Z0-9]+$/) === null){
           return notValidIdentifier;
        }else if(reservedWordsArray.includes(name.toLocaleLowerCase())){
           return notReservedWords;
        }
        return '';
    }

    /**
     * Validation for
     * Elements have a non-empty description.
     * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/uddl.ocl
     * invariant nonEmptyDescription
     */
    nonEmptyDescription(element: element.ConceptualObservable | element.LogicalUnit | element.LogicalLandmark | element.LogicalReferencePoint | 
        element.LogicalMeasurementSystem | element.LogicalMeasurementSystemAxis | element.LogicalCoordinateSystem | element.LogicalCoordinateSystemAxis | 
        element.LogicalMeasurementSystemConversion | element.LogicalBoolean | element.LogicalCharacter | element.LogicalNumeric | element.LogicalInteger | 
        element.LogicalNatural | element.LogicalNonNegativeReal | element.LogicalReal | element.LogicalString, accept:ValidationAcceptor):void{
       
        if(!this.hasDescription(element?.description)){
            accept('error', 'This element must have a Description.', {node : element, property : "description" });
        }
    }
    hasDescription(des: string|undefined):boolean{
        return des !== undefined && des?.trim().length !== 0;
    }


    /**
     * Validation for
     * An ConceptualEntity must have at least 2 characteristics
     * An ConceptualEntity is not a specialization of itself.
     * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
     * invariant noCyclesInSpecialization
     */
    checkEntityHasAtLeast2CharacteristicOrnoCyclesInSpecialization(entity: element.ConceptualEntity, accept: ValidationAcceptor): void{
        let centityspec: Set<string> = new Set();
        const result = this.getEntityCharacteristicsOrCycle(entity, centityspec, accept);
        if (result.length < 2) { 
            accept('error', 'Entity should have at least 2 characteristics.', {node: entity, property: "composition" });
        }    
    }
    getEntityCharacteristicsOrCycle(entity: element.ConceptualEntity, centityspec: Set<string>, accept: ValidationAcceptor): element.ConceptualCharacteristic[]{
        let result: element.ConceptualCharacteristic[] = [];
        centityspec.add(entity.name);
        const spec = entity.specializes?.ref;
        if (spec !== undefined) {
            if(centityspec.has(spec.name)){
                accept('error', 'An ConceptualEntity can not be specialization of itself.', { node: entity, property: "composition" });
                throw new Error(cycleInSpec);
            }else{
               
                result.concat(this.getEntityCharacteristicsOrCycle(spec, centityspec, accept)); 
            }
        }
        // No matter what, check this entity
        result = result.concat(entity.composition);
        return result;
    }


    /**
     * An Entity does not compose the same Observable more than once.
     * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conditional_observableComposedOnce.ocl
     * invariant observableComposedOnce
     */
    checkObservableComposedOnce(entity: element.ConceptualEntity, accept: ValidationAcceptor){
        if(this.observableComposedOnce(entity)){
            accept('error', 'An Entity does not compose the same Observable more than once', {node: entity , property: "name"});
        }
    }
    observableComposedOnce(model: element.ConceptualEntity):boolean{
        let observables: Set<string> = new Set();
        let result = false
        model.composition.forEach(item =>{
        if(item.type.ref?.$type === 'ConceptualObservable'){
           if(observables.has(item.type.ref?.name)){
               result =  true;
           }else{
              observables.add(item.type.ref?.name)
           }
        }
       })
       return result;
    }

    /**
     * A Conceptual ConceptualEntity contains a ConceptualComposition whose type is an ConceptualObservable named 'Identifier'.
     * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
     * invariant hasUniqueID
     */
    checkHasUniqueID(entity: element.ConceptualEntity, accept: ValidationAcceptor){

        if(this.hasUniqueID(entity)){
            accept('error', 'A ConceptualEntity needs a ConceptualComposition whose type is an ConceptualObservable named "Identifier"', {node: entity , property: "name"});  
        }
    }
    hasUniqueID(entity: element.ConceptualEntity): boolean{
        let hasID = false;
        entity.composition.forEach(item =>{
            if(item.type.ref?.$type === 'ConceptualObservable'){
                if(item.type.ref?.name.toLocaleLowerCase() === 'Identifier'.toLocaleLowerCase()){
                    hasID = true
                }
            }
        })
        return !hasID;
    }

    /**
     * Validation for
     * Every UddlElement in an DataModel has a unique name. 
     * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/datamodel.ocl 
     * invariant childModelsHaveUniqueNames
     */
    checkElementHasUniqueName(Modal: element.DataModel, accept: ValidationAcceptor): void{
        let reported = new Set<string>();
        // this.checkName(Modal.cdm, uddlNameContainer, accept);
        // this.checkName(Modal.ldm, uddlNameContainer, accept);
        // this.checkName(Modal.pdm, uddlNameContainer, accept);
        this.checkName(Modal.cdm, accept, reported);
        this.checkName(Modal.ldm, accept, reported);
        this.checkName(Modal.pdm, accept, reported);
    }
    checkName(Model: element.ConceptualDataModel[] | element.LogicalDataModel[] | element.PlatformDataModel[], accept: ValidationAcceptor, reported?: Set<string>): boolean{
        let result = false;
        
        Model.forEach((dmt) => { 
             
                dmt.element?.forEach((elm)=> {
                    
                    if(reported?.has(elm?.name?.toLocaleLowerCase())){
                        accept('error', 'This element must must have unique name', {node: elm, property: "name"});
                        result = true;    
                    }else{
                        reported?.add(elm?.name?.toLocaleLowerCase());
                    }
                });
             
            if('cdm' in dmt && dmt?.cdm!.length > 0){
                result = this.checkName(dmt.cdm, accept);
            }else if('ldm' in dmt && dmt?.ldm!.length > 0){
                result = this.checkName(dmt.ldm, accept);
            }else if('pdm' in dmt && dmt?.pdm!.length > 0){
                result = this.checkName(dmt.pdm, accept);
            }       
        }) 
        return result;
    }
    
    /**
     * A ConceptualCharacteristic's lowerBound is less than or equal to its upperBound, unless its upperBound is -1.
     * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
     * invariant lowerBound_LTE_UpperBound
     */
    checkLowerBound_LTE_UpperBound(model: element.ConceptualCharacteristic, accept: ValidationAcceptor){
        if(this.lowerBound_LTE_UpperBound(model)){
            accept('error', "A ConceptualCharacteristic's lowerBound is less than or equal to its upperBound, unless its upperBound is -1", {node: model, property: "lowerBound"});
        }
    }
    lowerBound_LTE_UpperBound(model: element.ConceptualCharacteristic):boolean{
        
        if(model.lowerBound && model.upperBound && model.upperBound !== -1){
          return !(model.lowerBound <= model.upperBound);
        }
        return false;
    }

    /*
     * A ConceptualCharacteristic's upperBound is equal to -1 or greater than 1.
     * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
     * invariant upperBoundValid
     */
     checkUpperBoundValid(model: element.ConceptualCharacteristic, accept: ValidationAcceptor){
        if(this.upperBoundValid(model)){
            accept('error', "A ConceptualCharacteristic's upperBound is equal to -1 or greater than 1", {node: model, property: "upperBound"});
        }
     }
     upperBoundValid(model: element.ConceptualCharacteristic):boolean{
         if(model.upperBound){
            return !(model.upperBound == 1 || model.upperBound >= 1);
         }
         return false;
     }
    
    /*
     * A ConceptualCharacteristic's lowerBound is greater than or equal to zero.
     * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
     * invariant lowerBoundValid
     */
     checkLowerBoundValid(model: element.ConceptualCharacteristic, accept: ValidationAcceptor){
        if(this.lowerBoundValid(model)){
            accept('error', "A ConceptualCharacteristic's lowerBound is greater than or equal to zero", {node: model, property: "upperBound"});
        }
     }
     lowerBoundValid(model: element.ConceptualCharacteristic):boolean{
        if(model.lowerBound){
            return !(model.lowerBound >= 0);
         }
         return false;
     }

}




