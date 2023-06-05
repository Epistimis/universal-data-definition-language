import { ValidationAcceptor, ValidationChecks, ValidationRegistry } from 'langium';
import * as element from './generated/ast';
import { UniversalDataDefinitionLanguageAstType} from './generated/ast';
import type { UniversalDataDefinitionLanguageServices } from './universal-data-definition-language-module';

// Helper constants

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
            ConceptualEntity: validator.checkEntityHasAtLeast2CharacteristicOrnoCyclesInSpecialization,
            UddlElement: validator.checkElementHasValidIdentifierOrReservedWord,
            DataModel: validator.checkElementHasUniqueName,
            ConceptualObservable: validator.nonEmptyDescription,    
        };
        this.register(checks, validator);
    }
}

/**
 * Implementation of custom validations. All validations are from UDDL java OCL files.
 */

export  class UniversalDataDefinitionLanguageValidator {
    //Validation for
    // A DataModel's name is not an IDL reserved words,(CR 242) 
    //UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/datamodel.ocl
    // The name of an Element is a valid identifier.
    //UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/uddl.ocl
    
    checkElementHasValidIdentifierOrReservedWord(uddlelm: element.UddlElement, accept: ValidationAcceptor){
        if(uddlelm.name){
            let result = this.hasValidIdentifierOrOrReservedWord(uddlelm.name);
            if(result !== ''){
                accept('error', result, {node: uddlelm, property: "name" });       
            }
        }
    }

    hasValidIdentifierOrOrReservedWord(name: string) {
        if(name.match(/^[a-zA-Z0-9]+$/) === null){
           return notValidIdentifier;
        }else if(reservedWordsArray.includes(name.toLocaleLowerCase())){
           return notReservedWords;
        }
        return '';
    }

    //Validation for
        /*
     * The following elements have a non-empty description:
     *   - Observable
     *   - Unit
     *   - Landmark
     *   - ReferencePoint
     *   - MeasurementSystem
     *   - MeasurementSystemAxis
     *   - CoordinateSystem
     *   - CoordinateSystemAxis
     *   - MeasurementSystemConversion
     *   - Boolean
     *   - Character
     *   - Numeric
     *   - Integer
     *   - Natural
     *   - NonNegativeReal
     *   - Real
     *   - String
     */
    //UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/uddl.ocl


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

    //Validation for
    //An ConceptualEntity must have at least 2 characteristics
    // An ConceptualEntity is not a specialization of itself.
    //UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl

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

    //Validation for
    //Every UddlElement in an DataModel has a unique name.
    //UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/datamodel.ocl

    checkElementHasUniqueName(Modal: element.DataModel, accept: ValidationAcceptor): void{
        let uddlNameContainer = new Set<string>();
        this.checkName(Modal.cdm, uddlNameContainer, accept);
        this.checkName(Modal.ldm, uddlNameContainer, accept);
        this.checkName(Modal.pdm, uddlNameContainer, accept);
    }

    checkName(Modal: element.ConceptualDataModel[] | element.LogicalDataModel[] | element.PlatformDataModel[], reported: Set<string>, accept: ValidationAcceptor): boolean{
        let result = false;
        
        Modal.forEach((dmt) => { 
            if(reported.has(dmt?.name?.toLocaleLowerCase())){
                accept('error', 'This element must must have unique name', {node: dmt, property: "name"}); 
                result = true; 
            }else{
                dmt.element?.forEach((elm)=> {
                    
                    if(reported.has(elm?.name?.toLocaleLowerCase())){
                        accept('error', 'This element must must have unique name', {node: elm, property: "name"});
                        result = true;    
                    }else{
                        reported.add(elm?.name?.toLocaleLowerCase());
                    }
                });
            }   
            reported.add(dmt?.name?.toLocaleLowerCase());
            if('cdm' in dmt && dmt?.cdm!.length > 0){
                result = this.checkName(dmt.cdm, reported,accept);
            }else if('ldm' in dmt && dmt?.ldm!.length > 0){
                result = this.checkName(dmt.ldm, reported, accept);
            }else if('pdm' in dmt && dmt?.pdm!.length > 0){
                result = this.checkName(dmt.pdm, reported, accept);
            }       
        }) 
        return result;
    }
}




