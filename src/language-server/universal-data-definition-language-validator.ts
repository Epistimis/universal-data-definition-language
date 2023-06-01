import { ValidationAcceptor, ValidationChecks, ValidationRegistry } from 'langium';
import * as element from './generated/ast';
import { UniversalDataDefinitionLanguageAstType} from './generated/ast';
import type { UniversalDataDefinitionLanguageServices } from './universal-data-definition-language-module';

/**
 * Registry for validation checks.
 */

export const reservedWords = ['abstract','alias','any','attribute' ,'bitfield' ,'bitmask' ,'bitset' ,'boolean' ,'case' ,'char' ,'component' ,'connector' ,'const' ,'consumes' ,'context' ,'custom' ,'default','double' ,'emits' ,'enum' ,'eventtype' ,'exception' ,'factory' ,'false','finder' ,'fixed' ,'float' ,'getraises' ,'home' ,'import','in' ,'inout' ,'interface','local' ,'long' ,'manages' ,'map' ,'mirrorport' ,'module' ,'multiple' ,'native','object' ,'octet','oneway' ,'out' ,'port' ,'porttype' ,'primarykey' ,'private' ,'provides' ,'public' ,'publishes' ,'raises' ,'readonly' ,'sequence' , 'setraises' ,'short' ,'string' ,'struct' ,'supports','switch','true' ,'truncatable','typedef','typeid' ,'typename' ,'typeprefix','union','unsigned','uses','valuebase','valuetype','void','wchar','wstring']

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
 * Implementation of custom validations.
 */

export class UniversalDataDefinitionLanguageValidator {

    checkElementHasValidIdentifierOrReservedWord(uddlelm: element.UddlElement, accept: ValidationAcceptor){
        if(uddlelm.name){
            let result = this.hasValidIdentifierOrOrReservedWord(uddlelm.name);
            if(result !== ''){
                accept('error', result, {node: uddlelm, property: "name" });       
            }
        }
    }

    hasValidIdentifierOrOrReservedWord(name: string): string {
        if(name.match(/^[a-zA-Z0-9]+$/) === null){
           return 'This element name must not contain any special charecter, it should be alphanumeric.';
        }else if(reservedWords.includes(name.toLocaleLowerCase())){
           return 'Reserved words can not be assigned as element"s name.';
        }
        return '';
    }

    nonEmptyDescription(element: element.ConceptualObservable | element.LogicalUnit | element.LogicalLandmark | element.LogicalReferencePoint | 
        element.LogicalMeasurementSystem | element.LogicalMeasurementSystemAxis | element.LogicalCoordinateSystem | element.LogicalCoordinateSystemAxis | 
        element.LogicalMeasurementSystemConversion | element.LogicalBoolean | element.LogicalCharacter | element.LogicalNumeric | element.LogicalInteger | 
        element.LogicalNatural | element.LogicalNonNegativeReal | element.LogicalReal | element.LogicalString, accept:ValidationAcceptor):void{
       
        if(!this.hasDiscription(element?.description)){
            accept('error', 'This element must have a description.', {node : element, property : "description" });
        }
    }

    hasDiscription(des: string|undefined):boolean{
        return des !== undefined && des?.trim().length !== 0;
    }

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
                throw new Error('An ConceptualEntity can not be specialization of itself.');
            }else{
                centityspec.add(spec.name);
                result.concat(this.getEntityCharacteristicsOrCycle(spec, centityspec, accept)); 
            }
        }
        // No matter what, check this entity
        result = result.concat(entity.composition);
        return result;
    }

    checkElementHasUniqueName(Modal: element.DataModel, accept: ValidationAcceptor): void{
        
        const reportcdm: Set<string> = new Set(); 
        const reportldm: Set<string> = new Set(); 
        const reportpdm: Set<string> = new Set(); 

        this.checkName(Modal.cdm, reportcdm, accept);
        this.checkName(Modal.ldm, reportldm, accept);
        this.checkName(Modal.pdm, reportpdm, accept);
    }


    checkName(modaltype: element.ConceptualDataModel[] | element.LogicalDataModel[] | element.PlatformDataModel[] , reported: Set<string>, accept: ValidationAcceptor): boolean{
        let result = false;
        modaltype.forEach((dmt) => { 
            if(reported.has(dmt.name)){
                accept('error', 'This element must must have unique name', {node: dmt, property: "name"}); 
                result = true;
            }else{
                reported.add(dmt.name);
                if('cdm' in dmt && dmt?.cdm!.length > 0){
                    result = this.checkName(dmt.cdm, reported, accept);
                }else if('ldm' in dmt && dmt?.ldm!.length > 0){
                    result = this.checkName(dmt.ldm, reported, accept);
                }else if('pdm' in dmt && dmt?.pdm!.length > 0){
                    result = this.checkName(dmt.pdm, reported, accept);
                } 
            }          
        })    
        return result
    }
}
