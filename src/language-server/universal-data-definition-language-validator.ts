import { ValidationAcceptor, ValidationChecks, ValidationRegistry } from 'langium';
import * as element from './generated/ast';
import { UniversalDataDefinitionLanguageAstType} from './generated/ast';
import type { UniversalDataDefinitionLanguageServices } from './universal-data-definition-language-module';

/**
* Helper constants
*/
export const reservedWordsArray = ['abstract','alias','any','attribute' ,'bitfield' ,'bitmask' ,'bitset' ,'boolean' ,'case' ,'char' ,'component' ,'connector' ,'const' ,'consumes' ,'context' ,'custom' ,'default','double' ,'emits' ,'enum' ,'eventtype' ,'exception' ,'factory' ,'false','finder' ,'fixed' ,'float' ,'getraises' ,'home' ,'import','in' ,'inout' ,'interface','local' ,'long' ,'manages' ,'map' ,'mirrorport' ,'module' ,'multiple' ,'native','object' ,'octet','oneway' ,'out' ,'port' ,'porttype' ,'primarykey' ,'private' ,'provides' ,'public' ,'publishes' ,'raises' ,'readonly' ,'sequence' , 'setraises' ,'short' ,'string' ,'struct' ,'supports','switch','true' ,'truncatable','typedef','typeid' ,'typename' ,'typeprefix','union','unsigned','uses','valuebase','valuetype','void','wchar','wstring']
export const cycleInSpec = 'An ConceptualEntity can not be specialization of itself.';
export const notUniqueName = 'Elements should have unique Name.';

/**
 * Registry for validation checks.
 */
export class UniversalDataDefinitionLanguageValidationRegistry extends ValidationRegistry {
    constructor(services: UniversalDataDefinitionLanguageServices) {
        super(services);     
        const validator = services.validation.UniversalDataDefinitionLanguageValidator;
        const checks: ValidationChecks<UniversalDataDefinitionLanguageAstType> = {
            ConceptualEntity:[validator.checkForUniqueID, validator.checkForCyclesInSpecialization, validator.checkObservableComposedOnce, validator.checkForAtLeastOneLocalConceptualCharacteristic, validator.checkCharacteristicsHaveUniqueRolenames],//validator.checkHasUniqueID
            ConceptualAssociation: [validator.checkForAtLeastOneLocalConceptualCharacteristic, validator.checkForAtLeastTwoParticipants],
            UddlElement: [validator.checkNameIsValidIdentifier, validator.checkNameIsReservedWord],
            DataModel: validator.checkElementHasUniqueName,
            ConceptualObservable: validator.checkIsDescriptionEmpty,
            ConceptualCharacteristic: [ validator.checkLowerBoundValid,  validator.checkUpperBoundValid, validator.checkLowerBound_LTE_UpperBound, validator.checkRolenameIsValidIdentifier]
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
    /** 
    * The name of an Element is a valid identifier. 
    * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/uddl.ocl
    * invariant nameIsValidIdentifier
    */
    checkNameIsValidIdentifier(model: element.UddlElement, accept: ValidationAcceptor){  
        if(model?.name){
            if(!this.isValidIdentifier(model.name)){
                accept('error', "This element name must not contain any special character, it should be alphanumeric.", {node: model, property: "name" });       
            }
        }
    }
    isValidIdentifier(name: string){
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
    checkNameIsReservedWord(model: element.UddlElement, accept: ValidationAcceptor){  
        if(model?.name){
            if(this.isReservedWord(model.name)){
                accept('error', "Reserved words can not be assigned as element's Name.", {node: model, property: "name" });       
            }
        }
    }
    isReservedWord(name: string){
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
    checkIsDescriptionEmpty(element: element.ConceptualObservable | element.LogicalUnit | element.LogicalLandmark | element.LogicalReferencePoint | 
        element.LogicalMeasurementSystem | element.LogicalMeasurementSystemAxis | element.LogicalCoordinateSystem | element.LogicalCoordinateSystemAxis | 
        element.LogicalMeasurementSystemConversion | element.LogicalBoolean | element.LogicalCharacter | element.LogicalNumeric | element.LogicalInteger | 
        element.LogicalNatural | element.LogicalNonNegativeReal | element.LogicalReal | element.LogicalString, accept:ValidationAcceptor):void{
       
        if(this.isDescriptionEmpty(element?.description)){
            accept('error', 'This element must have a Description.', {node : element, property : "description" });
        }
    }
    isDescriptionEmpty(des: string | undefined):boolean{
        return des === undefined && des!.trim().length !== 0
    }

    /**
     * An ConceptualEntity has at least one ConceptualCharacteristic defined locally (not through generalization).
     * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
     * invariant hasAtLeastOneLocalConceptualCharacteristic
     */
    checkForAtLeastOneLocalConceptualCharacteristic(model: element.ConceptualEntity | element.ConceptualAssociation, accept: ValidationAcceptor){
        if(!this.atLeastOneLocalConceptualCharacteristic(model)){
            accept('error', 'A ConceptualEntity must have at least one ConceptualCharacteristic defined locally', {node : model, property : "composition" });
        }
    }
    atLeastOneLocalConceptualCharacteristic(model: element.ConceptualEntity | element.ConceptualAssociation): boolean{
        if('participant' in model){
            let charactatistics = new Set([...model.participant, ...model.composition])
            if(charactatistics.size >= 1){
                return true
            }
        }else{
            if(model.composition.length >=1){
                return true
            }
        }
        return false
    }

    /**
     * An ConceptualEntity is not a specialization of itself.
     * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
     * invariant noCyclesInSpecialization
     */
    checkForCyclesInSpecialization(entity: element.ConceptualEntity, accept: ValidationAcceptor): void{
        let centityspec: Set<string> = new Set();   
        if (this.cyclesInSpecialization(entity, centityspec)) { 
            accept('error', 'An ConceptualEntity can not be specialization of itself.', {node: entity, property: "composition" });
        }    
    }
    cyclesInSpecialization(entity: element.ConceptualEntity, centityspec: Set<string>): boolean{
        let result = false
        centityspec.add(entity?.name);
        const spec = entity.specializes?.ref;
        if(spec !== undefined) {
            if(centityspec.has(spec.name)){
                result = true;
                return result
            }else{
                result = this.cyclesInSpecialization(spec, centityspec); 
            }
        }
        return result;
    }

    /**A ConceptualCharacteristic's rolename is unique within an ConceptualEntity.
     * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
     * invariant characteristicsHaveUniqueRolenames
    */
    checkCharacteristicsHaveUniqueRolenames(model: element.ConceptualEntity | element.ConceptualAssociation, accept: ValidationAcceptor){
        let report: Set<string> = new Set();
        if(!this.characteristicsHaveUniqueRolenames(model, report)){
            accept('error', "A ConceptualCharacteristic's rolename is unique within an ConceptualEntity", {node: model, property: "composition" });
        }
    }
    characteristicsHaveUniqueRolenames(model: element.ConceptualEntity | element.ConceptualAssociation, report: Set<string>):boolean{
        let result = true;

        model.composition.forEach(item =>{
            if(report.has(item.rolename)){
                result = false
            }else{
                report.add(item.rolename)
            }
        });
        if('participant' in model){
            model.participant.forEach(item =>{
                if(report.has(item.rolename)){
                    result = false
                }else{
                    report.add(item.rolename)
                }
            });
        }
        if(result && model.specializes?.ref){
            result = this.characteristicsHaveUniqueRolenames(model.specializes.ref, report)
        }
        return result
    }
   

    /**
     * An ConceptualAssociation has at least two Participants.
     * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
     * invariant hasAtLeastTwoParticipants
     */
    checkForAtLeastTwoParticipants(model: element.ConceptualAssociation , accept: ValidationAcceptor){
        const result = this.totalParticipants(model)
        if(result.length < 2){
            accept('error', 'A ConceptualAssociation must have at least two Participants', {node: model, property: "participant" });
        }
    }
    totalParticipants(model: element.ConceptualAssociation | element.ConceptualEntity ): element.ConceptualParticipant[]{
        let result: element.ConceptualParticipant[] = [];  
        if('participant' in model){
            result = result.concat(model.participant)
            if(model.specializes?.ref){
                result = result.concat(this.totalParticipants(model.specializes?.ref))
            }
        }
        return result
    }

    /**
     * An Entity does not compose the same Observable more than once.
     * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conditional_observableComposedOnce.ocl
     * invariant observableComposedOnce
     */
    checkObservableComposedOnce(entity: element.ConceptualEntity, accept: ValidationAcceptor){
        let observables: Set<string> = new Set();
        if(!this.observableComposedOnce(entity, observables)){
            accept('error', 'An Entity does not compose the same Observable more than once', {node: entity , property: "name"});
        }
    }
    observableComposedOnce(model: element.ConceptualEntity, observablecontainer: Set<string>):boolean{
        let result = true
        model.composition.forEach(item =>{
            if(item.type.ref?.$type === 'ConceptualObservable'){
               if(observablecontainer.has(item.type.ref?.name)){
                    result = false;
               }else{
                    observablecontainer.add(item.type.ref?.name)
               }
            }
        })
        if(result && model.specializes?.ref){
            result = this.observableComposedOnce(model.specializes?.ref, observablecontainer)
        }
        return result;
    }

    /**
     * A Conceptual ConceptualEntity contains a ConceptualComposition whose type is an ConceptualObservable named 'Identifier'.
     * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
     * invariant hasUniqueID
     */
    checkForUniqueID(entity: element.ConceptualEntity, accept: ValidationAcceptor){
        let observables: Set<string> = new Set();
        if(!this.uniqueID(entity, observables)){
            accept('error', 'A ConceptualEntity needs a ConceptualComposition whose type is an ConceptualObservable named "Identifier"', {node: entity , property: "name"});  
        }
    }
    uniqueID(entity: element.ConceptualEntity, observables: Set<string>): boolean{
        let hasID = false;
        entity.composition.forEach(item =>{
            if(item.type.ref?.$type === 'ConceptualObservable'){
                if(item.type.ref?.name.toLocaleLowerCase() === 'Identifier'.toLocaleLowerCase()){
                   hasID = true;
                   
                }
            }
        })
        if(!hasID && entity.specializes?.ref){
            hasID = this.uniqueID(entity.specializes?.ref, observables)
        }
        return hasID;
    }

    /**
     * Every UddlElement in an DataModel has a unique name. 
     * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/datamodel.ocl 
     * invariant childModelsHaveUniqueNames
     */
    checkElementHasUniqueName(model: element.DataModel, accept: ValidationAcceptor): void{
       // let reported = new Set<string>();
       if( !this.isNameUnique(model.cdm) || !this.isNameUnique(model.ldm) || !this.isNameUnique(model.pdm) ){
        accept('error', 'This element must must have unique name', {node: model, property: "name"});
       }
    }
    isNameUnique(model: element.ConceptualDataModel[] | element.LogicalDataModel[] | element.PlatformDataModel[]): boolean{
        let result = true;
        let reportedin = new Set<string>();
        
        model.forEach(item =>{
            if(reportedin.has(item.name)){
                result = false;
                console.log('have',result)
               

            }else{
                reportedin.add(item.name)
                
                item.element.forEach(elm =>{
                    
                    if(reportedin.has(elm.name)){
                        result = false;
                    }else{
                        reportedin.add(elm.name)  
                    }
                });
                
                if(result && 'cdm' in item && item.cdm.length){
                    result = this.isNameUnique(item.cdm)
                }
                if(result && 'ldm' in item && item.ldm.length){
                    result = this.isNameUnique(item.ldm)
                }
                if(result && 'pdm' in item && item.pdm.length){
                    result = this.isNameUnique(item.pdm)
                }   
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
        if(!this.lowerBound_LTE_UpperBound(model)){
            accept('error', "A ConceptualCharacteristic's lowerBound is less than or equal to its upperBound, unless its upperBound is -1", {node: model, property: "lowerBound"});
        }
    }
    lowerBound_LTE_UpperBound(model: element.ConceptualCharacteristic):boolean{   
        if(model.lowerBound && model.upperBound && model.upperBound !== -1){
          return model.lowerBound <= model.upperBound;
        }
        return false;
    }

    /*
     * A ConceptualCharacteristic's upperBound is equal to -1 or greater than 1.
     * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
     * invariant upperBoundValid
     */
     checkUpperBoundValid(model: element.ConceptualCharacteristic, accept: ValidationAcceptor){
        if(!this.upperBoundValid(model)){
            accept('error', "A ConceptualCharacteristic's upperBound is equal to -1 or greater than 1", {node: model, property: "upperBound"});
        }
     }
     upperBoundValid(model: element.ConceptualCharacteristic):boolean{
         if(model.upperBound){
            return model.upperBound === -1 || model.upperBound >= 1;
         }
         return false;
     }
    
    /*
     * A ConceptualCharacteristic's lowerBound is greater than or equal to zero.
     * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
     * invariant lowerBoundValid
     */
     checkLowerBoundValid(model: element.ConceptualCharacteristic, accept: ValidationAcceptor){
        if(!this.lowerBoundValid(model)){
            accept('error', "A ConceptualCharacteristic's lowerBound is greater than or equal to zero", {node: model, property: "upperBound"});
        }
     }
     lowerBoundValid(model: element.ConceptualCharacteristic):boolean{
        if(model.lowerBound){
            return model.lowerBound >= 0 ;
         }
         return false;
     }

    /**  The rolename of a ConceptualCharacteristic is a valid identifier.
    * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
    * invariant rolenameIsValidIdentifier
    */
    checkRolenameIsValidIdentifier(model: element.ConceptualCharacteristic, accept: ValidationAcceptor){
        
        if(!this.isValidIdentifier(model.rolename)){
            accept('error',"The rolename of a ConceptualCharacteristic should be a valid identifier" , {node: model, property: "rolename" }); 
        } 
    }
   
}






