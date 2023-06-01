import { ConceptualDataModel,ConceptualEntity, LogicalDataModel} from '../src/language-server/generated/ast';
import {UniversalDataDefinitionLanguageValidator} from "../src/language-server/universal-data-definition-language-validator"
import * as dummyObj from './uddl_dummy_obj'

const obj = new UniversalDataDefinitionLanguageValidator();

describe('langium', () => {
  
  test('check if identifier is alphanumeric', () => {
    expect(obj.hasValidIdentifierOrOrReservedWord('uddl1@23')).toBe('This element name must not contain any special charecter, it should be alphanumeric.');
  });

  test('check if identifier is valid and not reserved word', () => {
    expect(obj.hasValidIdentifierOrOrReservedWord('uddl123')).toBe('');
  });

  test('check if identifier is a reserved word', () => {
    expect(obj.hasValidIdentifierOrOrReservedWord('bitmask')).toBe('Reserved words can not be assigned as element"s name.');
  });
 
  test('check if elements have description', () => {
    expect(obj.hasDiscription('has description.')).toBeTruthy();
  });

  test('check if elements do not have description', () => {
    expect(obj.hasDiscription('   ')).toBeFalsy();
  });

  test('check if elemet has unique name', () => {
    let reported = new Set<string>();
    let result = obj.checkName(dummyObj.elm.cdm as ConceptualDataModel[], reported, dummyObj.accept);
    expect(result).toBeTruthy();
  });

  test('check if elemet has nonunique name', () => {
    let reported = new Set<string>();
    let result = obj.checkName(dummyObj.elm.ldm as LogicalDataModel[], reported, dummyObj.accept);
    expect(result).toBeFalsy();
  });
  
  test('check if conceptualEntity has at least 2 charectatestic', () => {
      let centityspec = new Set<string>();
        let res = obj.getEntityCharacteristicsOrCycle(dummyObj.centity2 as ConceptualEntity, centityspec, dummyObj.accept);
        const charlength = res.length >= 2;
        expect(charlength).toBeTruthy();
  });

  test('check if conceptualEntity has less than 2 charectatestic', () => {
    let centityspec = new Set<string>();
    let res = obj.getEntityCharacteristicsOrCycle(dummyObj.centity1 as ConceptualEntity, centityspec, dummyObj.accept);
    const charlength = res.length >= 2;
    expect(charlength).toBeFalsy();
  });

  test('check if conceptualEntity has cycle in specialization', () => {
    let centityspec = new Set<string>();
    expect(()=> obj.getEntityCharacteristicsOrCycle(dummyObj.centity3 as ConceptualEntity, centityspec, dummyObj.accept)).toThrow('An ConceptualEntity can not be specialization of itself.');
  });

});