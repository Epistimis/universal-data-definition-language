# UDDL Validation and Unit Tests for Validation Functions

## Description

This pull request aims to add the following validation rules to the AST node of UDDL. All this validation rules are in UDDL repository.
      
    File: UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/datamodel.ocl
    Context: UddlElement
    Invariant: nameIsNotReservedWord
    
    File: UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/uddl.ocl
    Context: UddlElement
    Invariant: nameIsValidIdentifier
    
    File: UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/uddl.ocl
    Context: ConceptualObservable
    Invariant: nonEmptyDescription
    
    File: UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
    Context: ConceptualEntity
    Invariant: noCyclesInSpecialization

    File: UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
    Context: ConceptualEntity
    Invariant: hasAtLeastOneLocalConceptualCharacteristic
   
    File: UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conditional_observableComposedOnce.ocl
    Context: ConceptualEntity
    Invariant: observableComposedOnce
       
    File: UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
    Context: ConceptualEntity
    Invariant: hasUniqueID

    File: UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
    Context: ConceptualEntity
    Invariant: characteristicsHaveUniqueRolenames

    File: UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
    Context: ConceptualEntity
    Invariant: specializingConceptualCharacteristicsConsistent

     File: UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
    Context: ConceptualAssociation
    Invariant: hasAtLeastTwoParticipants
     
    File: UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/datamodel.ocl
    Context: DataModel
    Invariant: childModelsHaveUniqueNames

    File: UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
    Context: ConceptualCharacteristic
    Invariant: lowerBound_LTE_UpperBound
    
    file: UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
    Context: ConceptualCharacteristic
    Invariant: upperBoundValid
    
    File: UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
    Context: ConceptualCharacteristic
    Invariant: lowerBoundValid

    File: UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
    Context: ConceptualCharacteristic
    Invariant: rolenameIsValidIdentifier

## Testing

- For testing the validation function of an ast node, need to define some dummy objects replicating the property of the ast node.  So   created a file that will contain all the dummy objects.
- To avoid complications, helper methods are created, which will only take the particular property of the validating node, to add validation. And the test has been done on the helper methods.

![All test cases have passed](uddl_test/unit_test_screenshots/unittest.jpg)

## Additional note
Multiple validation rules might be needed for a single property of an AST node. For example, for the name property of every UddlElement, we need to check if the name is a valid identifier and not a reserved word. Instead of applying the rules in separate functions, a single function has been added to avoid unexpected results.