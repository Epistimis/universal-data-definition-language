import { isNameUnique } from "../src/language-server/validation/dataModel"; 
import {elm} from './uddl_dummy_obj';
import { ConceptualDataModel, LogicalDataModel } from "../src/language-server/generated/ast";

describe('datamodel', () => {
  // This test checks if all UDDLElement's names within datamodel are unique.
  test('All contained elements must have unique names', () => {
    let c: unknown = elm.cdm;
    expect(isNameUnique(c as ConceptualDataModel[])).toBeTruthy();
    let l: unknown = elm.ldm;
    expect(isNameUnique(l as LogicalDataModel[])).toBeFalsy();
  });
});
