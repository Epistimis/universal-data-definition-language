import { ConceptualAssociation, ConceptualCharacteristic, ConceptualEntity, LogicalDataModel, ConceptualDataModel} from '../src/language-server/generated/ast';

import {UniversalDataDefinitionLanguageValidator} from "../src/language-server/validation/universal-data-definition-language-validator";
import * as dummyObj from './uddl_dummy_obj';

const obj = new UniversalDataDefinitionLanguageValidator();

describe('langium', () => {
  //This tests checks  if any element's name contains any special character or only alphanumeric.
  test('non alphanumeric is not valid identifier', () => {
    expect(obj.isValidIdentifier('uddl1@23')).toBeFalsy();
  });
  test('words without special character is a valid identifier', () => {
    expect(obj.isValidIdentifier('uddl123')).toBeTruthy;
  });
  
  //This tests checks  if any element's name is a reserved word.
  test('identifier is a reserved word', () => {
    expect(obj.isReservedWord('bitmask')).toBeTruthy();
  });
  test('identifier is not a reserved word', () => {
    expect(obj.isReservedWord('Hospital')).toBeFalsy();
  });

  //This tests checks  if elements has a description, does not contain only whitespace or an empty string.
  test('element has description', () => {
    expect(obj.isDescriptionEmpty('has description.')).toBeFalsy();
  });

  test("element's description consist of whitespace only", () => {
    expect(obj.isDescriptionEmpty('   ')).toBeTruthy();
  });

  test('element has no description', () => {
    expect(obj.isDescriptionEmpty('')).toBeTruthy();
  });

  //This tests checks if a ConceptualEntity has at least one ConceptualCharacteristic defined locally (not through generalization).
  test('ConceptualEntity does not have at least one local ConceptualCharacteristic', () => {
    expect(obj.atLeastOneLocalConceptualCharacteristic(dummyObj.centity1)).toBeFalsy();
  });

  test('ConceptualEntity has at least one local ConceptualCharacteristic', () => {
    expect(obj.atLeastOneLocalConceptualCharacteristic(dummyObj.centity2)).toBeTruthy();
  });

  //checks if conceptualentity specializes it self in the specialization cycle.
  test('ConceptualEntity has cycle in specialization', () => {
    let centityspec = new Set<string>();
    expect(obj.cyclesInSpecialization(dummyObj.centity3 as ConceptualEntity, centityspec)).toBeTruthy();
  });
  test('ConceptualEntity does not have cycle in specialization', () => {
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
  test("A ConceptualAssociation has at least two Participants", () => {
    const length = obj.totalParticipants(dummyObj.cassoc2 as ConceptualAssociation).length >=2;
    expect(length).toBeTruthy();
  });
  test("A ConceptualAssociation does not has at least two Participants", () => {
    const length = obj.totalParticipants(dummyObj.cassoc1 as ConceptualAssociation).length >=2;
    expect(length).toBeFalsy();
  });

  //An Entity does not compose the same Observable more than once. 
  test('Conceptualentity compose the same observable only once', () => {
    let centity = new Set<string>();
    expect(obj.observableComposedOnce(dummyObj.centity1, centity)).toBeTruthy();
  });
  test('Conceptualentity compose the same observable more than once', () => {
    let centity = new Set<string>();
    expect(obj.observableComposedOnce(dummyObj.centity3, centity)).toBeFalsy();
  });
  
  //A Conceptual ConceptualEntity contains a ConceptualComposition whose type is an ConceptualObservable named 'Identifier'.
  test('ConceptualEntity has a ConceptualComposition whose type is an ConceptualObservable named "Identifier"', () => {
    let centity = new Set<string>();
    expect(obj.uniqueID(dummyObj.centity3, centity)).toBeTruthy();
  });
  
  test('ConceptualEntity does not have a ConceptualComposition whose type is an ConceptualObservable named "Identifier"', () => {
    let centity = new Set<string>();
    expect(obj.uniqueID(dummyObj.centity2, centity)).toBeFalsy();
  });
  
  //If ConceptualEntity A' specializes ConceptualEntity A, all characteristics in A' specialize nothing, specialize characteristics from A,
  //or specialize characteristics from a ConceptualEntity that is a generalization of A. (If A' does not specialize, none of its characteristics specialize.)
  test("A Conceptualentity does not specialize, so none of it's characteristics specialize", () => {
    expect(obj.specializingConceptualCharacteristicsConsistent(dummyObj.centity1)).toBeTruthy();
  });
  test(`ConceptualEntity A' specializes ConceptualEntity A, all characteristics in A' specialize nothing from A, 
        or specialize characteristics from a ConceptualEntity that is a generalization of A`, 
        () => {
          expect(obj.specializingConceptualCharacteristicsConsistent(dummyObj.cassoc1 )).toBeTruthy();
        }
  );
  test(`ConceptualEntity A' specializes ConceptualEntity A, characteristics in A' specialize from A, 
        or specialize characteristics from a ConceptualEntity that is a generalization of A`, 
        () => {
          expect(obj.specializingConceptualCharacteristicsConsistent(dummyObj.cassoc2 )).toBeFalsy();
  });

  //This tests checks all UDDLElement's names within datamodel are unique.
  test('All contained elements must have unique name', () => {
    let c:unknown = dummyObj.elm.cdm 
    expect(obj.isNameUnique(c as ConceptualDataModel[])).toBeTruthy();
    let l:unknown = dummyObj.elm.ldm 
    expect(obj.isNameUnique(l as LogicalDataModel[])).toBeFalsy();
  });

  //A ConceptualCharacteristic's lowerBound is less than or equal to its upperBound, unless its upperBound is -1.
  test('ConceptualCharacteristic"s lowerBound is less than or equal to its upperBound', () => {
    expect(obj.lowerBound_LTE_UpperBound(dummyObj.concomposition1 as ConceptualCharacteristic)).toBeTruthy();
  });
  test('ConceptualCharacteristic"s lowerBound is not less than or equal to its upperBound', () => {
    expect(obj.lowerBound_LTE_UpperBound(dummyObj.concomposition4 as ConceptualCharacteristic)).toBeFalsy();
  });

  //A ConceptualCharacteristic's upperBound is equal to -1 or greater than 1.
  test('ConceptualCharacteristic"s upperBound is equal to -1 or greater than 1', () => {
    expect(obj.upperBoundValid(dummyObj.concomposition1 as ConceptualCharacteristic)).toBeTruthy();
  });
  test('ConceptualCharacteristic"s upperBound is not equal to -1 or greater than 1', () => {
    expect(obj.upperBoundValid(dummyObj.concomposition2 as ConceptualCharacteristic)).toBeFalsy();
  });

  //A ConceptualCharacteristic's lowerBound is greater than or equal to zero.
  test('ConceptualCharacteristic"s lowerBound is greater than or equal to zero', () => { 
    expect(obj.lowerBoundValid(dummyObj.concomposition2 as ConceptualCharacteristic)).toBeTruthy();
  });
  test('ConceptualCharacteristic"s lowerBound is not greater than or equal to zero', () => { 
    expect(obj.lowerBoundValid(dummyObj.concomposition3 as ConceptualCharacteristic)).toBeFalsy();
  });

});