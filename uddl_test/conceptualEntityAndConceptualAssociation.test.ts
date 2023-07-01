  
  import { atLeastOneLocalConceptualCharacteristic, cyclesInSpecialization, characteristicsHaveUniqueRolenames, totalParticipants, observableComposedOnce, uniqueID, specializingConceptualCharacteristicsConsistent } from "../src/language-server/validation/conceptualDataModel/conceptualEntityAndConceptualAssociation";
  import { centity1, centity2, centity3, centity4, cassoc1, cassoc2 } from "./uddl_dummy_obj";
  import { ConceptualEntity, ConceptualAssociation } from "../src/language-server/generated/ast";

  describe('conceptualEntityAndConceptualCharacteristics', () => {
    // This test checks if a ConceptualEntity has at least one ConceptualCharacteristic defined locally (not through generalization).
    test('ConceptualEntity does not have at least one local ConceptualCharacteristic', () => {
      expect(atLeastOneLocalConceptualCharacteristic(centity1)).toBeFalsy();
    });
  
    test('ConceptualEntity has at least one local ConceptualCharacteristic', () => {
      expect(atLeastOneLocalConceptualCharacteristic(centity2)).toBeTruthy();
    });
  
    // Checks if a ConceptualEntity specializes itself in the specialization cycle.
    test('ConceptualEntity has a cycle in specialization', () => {
      let centityspec = new Set<string>();
      expect(cyclesInSpecialization(centity3 as ConceptualEntity, centityspec)).toBeTruthy();
    });
    test('ConceptualEntity does not have a cycle in specialization', () => {
      let centityspec = new Set<string>();
      expect(cyclesInSpecialization(centity4 as ConceptualEntity, centityspec)).toBeFalsy();
    });
  
    // Check if a ConceptualCharacteristic's rolename is unique within a ConceptualEntity.
    test("ConceptualCharacteristic's rolename is unique within a ConceptualEntity", () => {
      let centityspec = new Set<string>();
      expect(characteristicsHaveUniqueRolenames(centity2 as ConceptualEntity, centityspec)).toBeTruthy();
    });
    test("ConceptualCharacteristic's rolename is not unique within a ConceptualEntity", () => {
      let centityspec = new Set<string>();
      expect(characteristicsHaveUniqueRolenames(centity4 as ConceptualEntity, centityspec)).toBeFalsy();
    });
  
    // Check if a ConceptualAssociation has at least two Participants.
    test("A ConceptualAssociation has at least two Participants", () => {
      const length = totalParticipants(cassoc2 as ConceptualAssociation).length >= 2;
      expect(length).toBeTruthy();
    });
    test("A ConceptualAssociation does not have at least two Participants", () => {
      const length = totalParticipants(cassoc1 as ConceptualAssociation).length >= 2;
      expect(length).toBeFalsy();
    });
  
    // An Entity does not compose the same Observable more than once.
    test('ConceptualEntity composes the same Observable only once', () => {
      let centity = new Set<string>();
      expect(observableComposedOnce(centity1, centity)).toBeTruthy();
    });
    test('ConceptualEntity composes the same Observable more than once', () => {
      let centity = new Set<string>();
      expect(observableComposedOnce(centity3, centity)).toBeFalsy();
    });
  
    // A ConceptualEntity contains a ConceptualComposition whose type is a ConceptualObservable named 'Identifier'.
    test('ConceptualEntity has a ConceptualComposition whose type is a ConceptualObservable named "Identifier"', () => {
      let centity = new Set<string>();
      expect(uniqueID(centity3, centity)).toBeTruthy();
    });
  
    test('ConceptualEntity does not have a ConceptualComposition whose type is a ConceptualObservable named "Identifier"', () => {
      let centity = new Set<string>();
      expect(uniqueID(centity2, centity)).toBeFalsy();
    });
  
  // If ConceptualEntity A' specializes ConceptualEntity A, all characteristics in A' specialize nothing, specialize characteristics from A,
  // or specialize characteristics from a ConceptualEntity that is a generalization of A. (If A' does not specialize, none of its characteristics specialize.)  
  test("A ConceptualEntity does not specialize, so none of its characteristics specialize", () => {
    expect(specializingConceptualCharacteristicsConsistent(centity1)).toBeTruthy();
  });
  test(`ConceptualEntity A' specializes ConceptualEntity A, all characteristics in A' specialize nothing from A,
        or specialize characteristics from a ConceptualEntity that is a generalization of A`,
        () => {
          expect(specializingConceptualCharacteristicsConsistent(cassoc1)).toBeTruthy();
        }
  );
  test(`ConceptualEntity A' specializes ConceptualEntity A, characteristics in A' specialize from A,
        or specialize characteristics from a ConceptualEntity that is a generalization of A`,
        () => {
          expect(specializingConceptualCharacteristicsConsistent(cassoc2)).toBeFalsy();
  });


});