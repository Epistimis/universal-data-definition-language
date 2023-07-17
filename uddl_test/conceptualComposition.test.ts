import {typeConsistentWithSpecialization, isMultiplicityConsistentWithSpecialization, isSpecializationDistinct} from "../src/language-server/validation/conceptualDataModel/conceptualComposition";
import {concomposition1, concomposition2} from './uddl_dummy_obj';
import { ConceptualComposition } from "../src/language-server/generated/ast";

describe('conceptualComposition', () => {
    // This test checks if a conceptualComposition's type is consistent with specialization.
    test("A conceptualComposition's type is consistent with specialization", () => {
      expect(typeConsistentWithSpecialization(concomposition1 as ConceptualComposition)).toBeTruthy();
    });
    test("A conceptualComposition's type is not consistent with specialization", () => {
      expect(typeConsistentWithSpecialization(concomposition2 as ConceptualComposition)).toBeFalsy();
    });

    // This test checks if a ConceptualComposition specializes, its multiplicity is at least as restrictive as the ConceptualComposition it specializes.
    test("Multiplicity must be consistent with specialization", () => {
      expect(isMultiplicityConsistentWithSpecialization(concomposition1 as ConceptualComposition)).toBeTruthy();
    });
    test("Multiplicity must be consistent with specialization", () => {
      expect(isMultiplicityConsistentWithSpecialization(concomposition2 as ConceptualComposition)).toBeFalsy();
    });
  
    // This test checks if a ConceptualComposition specializes, its type or multiplicity is different from the ConceptualComposition it specializes..
    test("Specialization must be distinct", () => {
        expect(isSpecializationDistinct(concomposition1 as ConceptualComposition)).toBeTruthy();
    });
    test("Specialization must be distinct", () => {
        expect(isSpecializationDistinct(concomposition2 as ConceptualComposition)).toBeFalsy();
    });
});
