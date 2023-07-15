import {pathNodeResolvable} from "../src/language-server/validation/conceptualDataModel/conceptualPathNode";
import {datamodel, concharpathnode1,concharpathnode2} from './uddl_dummy_obj';
import { ConceptualPathNode, DataModel,  } from "../src/language-server/generated/ast";

describe('conceptualComposition', () => {
    // If a ConceptualPathNode "A" is not the last in a path sequence, the next ConceptualPathNode in the sequence is resolvable from the "node type" of A.
    
    test("Path Node is Resolvable", () => {
      expect(pathNodeResolvable(concharpathnode1 as ConceptualPathNode,datamodel as DataModel)).toBeTruthy();
    });
    test("Path Node is Resolvable", () => {
      expect(pathNodeResolvable(concharpathnode2 as ConceptualPathNode,datamodel as DataModel)).toBeFalsy();
    });
});