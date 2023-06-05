import { ConceptualDataModel, ConceptualEntity, LogicalDataModel,PlatformDataModel} from '../src/language-server/generated/ast';
import {cycleInSpec,notReservedWords,notValidIdentifier} from "../src/language-server/universal-data-definition-language-validator";
import {UniversalDataDefinitionLanguageValidator} from "../src/language-server/universal-data-definition-language-validator";
import * as dummyObj from './uddl_dummy_obj';

const obj = new UniversalDataDefinitionLanguageValidator();

describe('langium', () => {
  //This tests checks  if any element's name conatain any special character or only contain alphanumeric and not a reserveved word.
  
  test('check if identifier is alphanumeric', () => {
    expect(obj.hasValidIdentifierOrOrReservedWord('uddl1@23')).toBe(notValidIdentifier);
  });

  test('check if identifier is a reserved word', () => {
    expect(obj.hasValidIdentifierOrOrReservedWord('bitmask')).toBe(notReservedWords);
  });

  test('check if identifier is valid and not reserved word', () => {
    expect(obj.hasValidIdentifierOrOrReservedWord('uddl123')).toBe('');
  });

  //This tests checks  if elements has a description, does not contain only whitespaces or an empty string.
 
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
    let name = new Set<string>();
    let c:unknown = dummyObj.elm.cdm 
    let resultc = obj.checkName(c as ConceptualDataModel[],name,dummyObj.accept);
    expect(resultc).toBeFalsy();
    let l:unknown = dummyObj.elm.ldm 
    let resultl = obj.checkName(l as LogicalDataModel[],name,dummyObj.accept);
    expect(resultl).toBeTruthy();
    let p:unknown = dummyObj.elm.ldm 
    let resultp = obj.checkName(p as PlatformDataModel[],name,dummyObj.accept);
    expect(resultp).toBeTruthy();
  });



  //This test checks if any conceptualentity has 2 or more characteristics, or has less than two characteristics
  //and also checks if conceptualentity specializes it self in the specialization cycle.
  
  test('check if conceptualEntity has at least 2 characteristic', () => {
    let centityspec = new Set<string>();
    let res = obj.getEntityCharacteristicsOrCycle(dummyObj.centity2 as ConceptualEntity, centityspec, dummyObj.accept);
    const charlength = res.length >= 2;
    expect(charlength).toBeTruthy();
  });

  test('check if conceptualEntity has less than 2 characteristic', () => {
    let centityspec = new Set<string>();
    let res = obj.getEntityCharacteristicsOrCycle(dummyObj.centity1 as ConceptualEntity, centityspec, dummyObj.accept);
    const charlength = res.length >= 2;
    expect(charlength).toBeFalsy();
  });

  test('check if conceptualEntity has cycle in specialization', () => {
    let centityspec = new Set<string>();
    expect(()=> obj.getEntityCharacteristicsOrCycle(dummyObj.centity3 as ConceptualEntity, centityspec, dummyObj.accept)).toThrow(cycleInSpec);
  });

});