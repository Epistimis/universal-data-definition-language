import { isValidIdentifier, isReservedWord, isDescriptionEmpty } from "../src/language-server/validation/uddlElement";

describe('uddlelement', () => {

  // This test checks if any element's name contains any special character or only alphanumeric.
  test('Non-alphanumeric characters are not valid identifiers', () => {
    expect(isValidIdentifier('uddl1@23')).toBeFalsy();
  });
  test('A word without special characters is a valid identifier', () => {
    expect(isValidIdentifier('uddl123')).toBeTruthy();
  });
  
  // This test checks if any element's name is a reserved word.
  test('Identifier is a reserved word', () => {
    expect(isReservedWord('bitmask')).toBeTruthy();
  });
  test('Identifier is not a reserved word', () => {
    expect(isReservedWord('Hospital')).toBeFalsy();
  });

  // This test checks if elements have a description, do not contain only whitespace or an empty string.
  test('Element has a description', () => {
    expect(isDescriptionEmpty('has description.')).toBeFalsy();
  });

  test("Element's description consists of whitespace only", () => {
    expect(isDescriptionEmpty('   ')).toBeTruthy();
  });

  test('Element has no description', () => {
    expect(isDescriptionEmpty('')).toBeTruthy();
  });

});
