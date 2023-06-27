import {typeConsistentWithSpecialization} from "../src/language-server/validation/conceptualDataModel/conceptualComposition";
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
  });
  