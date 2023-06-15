import { ConceptualCharacteristic, ConceptualDataModel, ConceptualEntity, LogicalDataModel,PlatformDataModel} from '../src/language-server/generated/ast';
import {cycleInSpec,notReservedWords,notValidIdentifier} from "../src/language-server/universal-data-definition-language-validator";
import {UniversalDataDefinitionLanguageValidator} from "../src/language-server/universal-data-definition-language-validator";
import * as dummyObj from './uddl_dummy_obj';

const obj = new UniversalDataDefinitionLanguageValidator();

describe('langium', () => {
  //This tests checks  if any element's name contains any special character or only contains alphanumeric and not a reserved word.
  
  test('check if identifier is alphanumeric', () => {
    expect(obj.hasValidIdentifier('uddl1@23')).toBe(notValidIdentifier);
  });

  test('check if identifier is a reserved word', () => {
    expect(obj.isReservedWord('bitmask')).toBe(notReservedWords);
  });

  test('check if identifier is valid and not reserved word', () => {
    expect(obj.hasValidIdentifier('uddl123')).toBe('');
  });

  //This tests checks  if elements has a description, does not contain only whitespace or an empty string.
 
  test('check if elements have description', () => {
    expect(obj.hasDescription('has description.')).toBeTruthy();
  });

  test('check if elements do not have description', () => {
    expect(obj.hasDescription('   ')).toBeFalsy();
  });

  test('check if elements do not have description', () => {
    expect(obj.hasDescription('')).toBeFalsy();
  });

  //This tests checks all UDDLElement's names within datamodel are unique.

  test('check if elemet has unique name', () => {
    //let name = new Set<string>();
    let c:unknown = dummyObj.elm.cdm 
    let resultc = obj.checkName(c as ConceptualDataModel[]);
    expect(resultc).toBeFalsy();
    let l:unknown = dummyObj.elm.ldm 
    let resultl = obj.checkName(l as LogicalDataModel[]);
    expect(resultl).toBeTruthy();
    let p:unknown = dummyObj.elm.ldm 
    let resultp = obj.checkName(p as PlatformDataModel[]);
    expect(resultp).toBeTruthy();
  });

  //This test checks if any conceptualentity has 2 or more characteristics, or has less than two characteristics
  //and also checks if conceptualentity specializes it self in the specialization cycle.
  
  test('check if conceptualEntity has at least 2 characteristic', () => {
    let res = obj.hasAtLeastOneLocalConceptualCharacteristic(dummyObj.centity2 as ConceptualEntity);
    expect(res).toBeTruthy();
  });

  test('check if conceptualEntity has less than 2 characteristic', () => {
    let res = obj.hasAtLeastOneLocalConceptualCharacteristic(dummyObj.centity1 as ConceptualEntity,);
    expect(res).toBeFalsy();
  });

  test('check if conceptualEntity has cycle in specialization', () => {
    let centityspec = new Set<string>();
    expect(()=> obj.getEntityCycle(dummyObj.centity3 as ConceptualEntity, centityspec)).toThrow(cycleInSpec);
  });

  //An Entity does not compose the same Observable more than once. 
  test('check an entity compose the same observable only once', () => {
    let centity = new Set<string>();
    expect(obj.observableComposedOnce(dummyObj.centity1, centity)).toBeFalsy();
  });
  test('check an entity compose the same observable more than once', () => {
    let centity = new Set<string>();
    expect(obj.observableComposedOnce(dummyObj.centity2, centity)).toBeTruthy();
  });

  //A Conceptual ConceptualEntity contains a ConceptualComposition whose type is an ConceptualObservable named 'Identifier'.

  test('check if a conceptualEntity has a ConceptualComposition whose type is an ConceptualObservable named "Identifier"', () => {
    let centity = new Set<string>();
    expect(obj.hasUniqueID(dummyObj.centity3, centity)).toBeTruthy();
  });

  test('check if a conceptualEntity has a ConceptualComposition whose type is an ConceptualObservable named "Identifier"', () => {
    let centity = new Set<string>();
    expect(obj.hasUniqueID(dummyObj.centity2, centity)).toBeTruthy();
  });

  //A ConceptualCharacteristic's lowerBound is less than or equal to its upperBound, unless its upperBound is -1.
  test('check if a ConceptualCharacteristic"s lowerBound is less than or equal to its upperBound', () => {
    
    expect(obj.lowerBound_LTE_UpperBound(dummyObj.concomposition1 as ConceptualCharacteristic)).toBeFalsy();
  });

  //A ConceptualCharacteristic's upperBound is equal to -1 or greater than 1.
  test('check if a ConceptualCharacteristic"s upperBound is equal to -1 or greater than 1', () => {
    
    expect(obj.upperBoundValid(dummyObj.concomposition2 as ConceptualCharacteristic)).toBeFalsy();
  });

  //A ConceptualCharacteristic's lowerBound is greater than or equal to zero.
  test('check if a ConceptualCharacteristic"s lowerBound is greater than or equal to zero', () => {
    
    expect(obj.lowerBoundValid(dummyObj.concomposition3 as ConceptualCharacteristic)).toBeFalsy();
  });

});