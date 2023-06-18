import { ConceptualAssociation, ConceptualCharacteristic, ConceptualEntity, LogicalDataModel} from '../src/language-server/generated/ast';

import {UniversalDataDefinitionLanguageValidator} from "../src/language-server/universal-data-definition-language-validator";
import * as dummyObj from './uddl_dummy_obj';

const obj = new UniversalDataDefinitionLanguageValidator();

describe('langium', () => {
  //This tests checks  if any element's name contains any special character or only alphanumeric.
  test('check if identifier is alphanumeric', () => {
    expect(obj.isValidIdentifier('uddl1@23')).toBeFalsy();
  });
  test('check if identifier is valid and not reserved word', () => {
    expect(obj.isValidIdentifier('uddl123')).toBeTruthy;
  });
  
  //This tests checks  if any element's name is a reserved word.
  test('check if identifier is a reserved word', () => {
    expect(obj.isReservedWord('bitmask')).toBeTruthy();
  });
  test('check if identifier is a reserved word', () => {
    expect(obj.isReservedWord('Hospital')).toBeFalsy();
  });

  //This tests checks  if elements has a description, does not contain only whitespace or an empty string.
  test('check if elements have description', () => {
    expect(obj.isDescriptionEmpty('has description.')).toBeFalsy();
  });

  test('check if elements do not have description', () => {
    expect(obj.isDescriptionEmpty('   ')).toBeTruthy();
  });

  test('check if elements do not have description', () => {
    expect(obj.isDescriptionEmpty('')).toBeTruthy();
  });

  //This tests checks if an ConceptualEntity has at least one ConceptualCharacteristic defined locally (not through generalization).
  test('check if element does not has at least one local ConceptualCharacteristic', () => {
    expect(obj.atLeastOneLocalConceptualCharacteristic(dummyObj.centity1)).toBeFalsy();
  });

  test('check if element has at least one local ConceptualCharacteristic', () => {
    expect(obj.atLeastOneLocalConceptualCharacteristic(dummyObj.centity2)).toBeTruthy();
  });

  //checks if conceptualentity specializes it self in the specialization cycle.
  test('check if conceptualEntity has cycle in specialization', () => {
    let centityspec = new Set<string>();
    expect(obj.cyclesInSpecialization(dummyObj.centity3 as ConceptualEntity, centityspec)).toBeTruthy();
  });
  test('check if conceptualEntity does not has cycle in specialization', () => {
    let centityspec = new Set<string>();
    expect(obj.cyclesInSpecialization(dummyObj.centity4 as ConceptualEntity, centityspec)).toBeFalsy();
  });

  //Check if a ConceptualCharacteristic's rolename is unique within an ConceptualEntity.
  test("ConceptualCharacteristic's rolename is unique within an ConceptualEntity", () => {
    let centityspec = new Set<string>();
    expect(obj.characteristicsHaveUniqueRolenames(dummyObj.centity2 as ConceptualEntity, centityspec)).toBeTruthy();
  });
  test("ConceptualCharacteristic's rolename is not unique within an ConceptualEntity", () => {
    let centityspec = new Set<string>();
    expect(obj.characteristicsHaveUniqueRolenames(dummyObj.centity4 as ConceptualEntity, centityspec)).toBeFalsy();
  });

  //Check if An ConceptualAssociation has at least two Participants.
  test("An ConceptualAssociation has at least two Participants", () => {
    const length = obj.totalParticipants(dummyObj.cassoc2 as ConceptualAssociation).length >=2;
    expect(length).toBeTruthy();
  });
  test("An ConceptualAssociation does not has at least two Participants", () => {
    const length = obj.totalParticipants(dummyObj.cassoc1 as ConceptualAssociation).length >=2;
    expect(length).toBeFalsy();
  });

  //An Entity does not compose the same Observable more than once. 
  test('check an entity compose the same observable only once', () => {
    let centity = new Set<string>();
    expect(obj.observableComposedOnce(dummyObj.centity1, centity)).toBeTruthy();
  });
  test('check an entity compose the same observable more than once', () => {
    let centity = new Set<string>();
    expect(obj.observableComposedOnce(dummyObj.centity3, centity)).toBeFalsy();
  });
  
  //A Conceptual ConceptualEntity contains a ConceptualComposition whose type is an ConceptualObservable named 'Identifier'.
  test('check if a conceptualEntity has a ConceptualComposition whose type is an ConceptualObservable named "Identifier"', () => {
    let centity = new Set<string>();
    expect(obj.uniqueID(dummyObj.centity3, centity)).toBeTruthy();
  });
  
  test('check if a conceptualEntity does not has a ConceptualComposition whose type is an ConceptualObservable named "Identifier"', () => {
    let centity = new Set<string>();
    expect(obj.uniqueID(dummyObj.centity2, centity)).toBeFalsy();
  });

  //This tests checks all UDDLElement's names within datamodel are unique.
  test('check if contained elements have unique name', () => {
    // let c:unknown = dummyObj.elm.cdm 
    // expect(obj.isNameUnique(c as ConceptualDataModel[])).toBeTruthy();
    let l:unknown = dummyObj.elm.ldm 
    expect(obj.isNameUnique(l as LogicalDataModel[])).toBeFalsy();
    // let p:unknown = dummyObj.elm.ldm 
    // expect(obj.isNameUnique(p as PlatformDataModel[])).toBeFalsy();
  });

  //A ConceptualCharacteristic's lowerBound is less than or equal to its upperBound, unless its upperBound is -1.
  test('check if a ConceptualCharacteristic"s lowerBound is less than or equal to its upperBound', () => {
    expect(obj.lowerBound_LTE_UpperBound(dummyObj.concomposition1 as ConceptualCharacteristic)).toBeTruthy();
  });
  test('check if a ConceptualCharacteristic"s lowerBound is not less than or equal to its upperBound', () => {
    expect(obj.lowerBound_LTE_UpperBound(dummyObj.concomposition4 as ConceptualCharacteristic)).toBeFalsy();
  });

  //A ConceptualCharacteristic's upperBound is equal to -1 or greater than 1.
  test('check if a ConceptualCharacteristic"s upperBound is equal to -1 or greater than 1', () => {
    expect(obj.upperBoundValid(dummyObj.concomposition1 as ConceptualCharacteristic)).toBeTruthy();
  });
  test('check if a ConceptualCharacteristic"s upperBound is not equal to -1 or greater than 1', () => {
    expect(obj.upperBoundValid(dummyObj.concomposition2 as ConceptualCharacteristic)).toBeFalsy();
  });

  //A ConceptualCharacteristic's lowerBound is greater than or equal to zero.
  test('check if a ConceptualCharacteristic"s lowerBound is greater than or equal to zero', () => { 
    expect(obj.lowerBoundValid(dummyObj.concomposition2 as ConceptualCharacteristic)).toBeTruthy();
  });
  test('check if a ConceptualCharacteristic"s lowerBound is not greater than or equal to zero', () => { 
    expect(obj.lowerBoundValid(dummyObj.concomposition3 as ConceptualCharacteristic)).toBeFalsy();
  });

});