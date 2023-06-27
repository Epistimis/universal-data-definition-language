import { lowerBoundValid, lowerBound_LTE_UpperBound, upperBoundValid } from "../src/language-server/validation/conceptualDataModel/conceptualCharacteristic";
import { concomposition1, concomposition2, concomposition3, concomposition4 } from "./uddl_dummy_obj";
import { ConceptualCharacteristic } from "../src/language-server/generated/ast";

describe('ConceptualCharacteristics', () => {
  //A ConceptualCharacteristic's lowerBound is less than or equal to its upperBound, unless its upperBound is -1.
  test('ConceptualCharacteristic\'s lowerBound is less than or equal to its upperBound', () => {
    expect(lowerBound_LTE_UpperBound(concomposition1 as ConceptualCharacteristic)).toBeTruthy();
  });
  test('ConceptualCharacteristic\'s lowerBound is not less than or equal to its upperBound', () => {
    expect(lowerBound_LTE_UpperBound(concomposition4 as ConceptualCharacteristic)).toBeFalsy();
  });

  // A ConceptualCharacteristic's upperBound is equal to -1 or greater than 1.
  test('ConceptualCharacteristic\'s upperBound is equal to -1 or greater than 1', () => {
    expect(upperBoundValid(concomposition1 as ConceptualCharacteristic)).toBeTruthy();
  });
  test('ConceptualCharacteristic\'s upperBound is not equal to -1 or greater than 1', () => {
    expect(upperBoundValid(concomposition2 as ConceptualCharacteristic)).toBeFalsy();
  });

  // A ConceptualCharacteristic's lowerBound is greater than or equal to zero.
  test('ConceptualCharacteristic\'s lowerBound is greater than or equal to zero', () => {
    expect(lowerBoundValid(concomposition2 as ConceptualCharacteristic)).toBeTruthy();
  });
  test('ConceptualCharacteristic\'s lowerBound is not greater than or equal to zero', () => {
    expect(lowerBoundValid(concomposition3 as ConceptualCharacteristic)).toBeFalsy();
  });
});
