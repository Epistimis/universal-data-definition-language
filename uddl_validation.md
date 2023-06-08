# UDDL Validation and Unit Tests for Validation Functions

## Description

This pull request aims to add the following validation rules to the AST node of UDDL. All this validation rules are in UDDL repository.
                              
  File: com.epistimis.uddl/src/com.epistimis.uddl.constraints/uddl.ocl
  Context: UddlElement
  Invariants: nameIsValidIdentifier, nonEmptyDescription

  File: com.epistimis.uddl/src/com.epistimis.uddl.constraints/uddl.ocl
  Context: DataModel
  Invariants: nameIsValidIdentifier, nonEmptyDescription
    
  File: com.epistimis.uddl/src/com.epistimis.uddl.constraints/uddl.ocl
   Context: ConceptualEntity
  Invariants: nameIsValidIdentifier, nonEmptyDescription

## Testing

- For testing the validation function of an ast node, need to define some dummy objects replicating the property of the ast node.  So   created a file that will contain all the dummay objects.
- To avoid complications, helper mathods are created, which will only take the perticular property of the validating node, to add validation. And the test has been done on the helper methods.

![All test cases have passed](uddl_test/unit_test_screenshots/unittest.jpg)

## Additional note
Multiple validation rules might be needed for a single property of an AST node. For example, for the name property of every UddlElement, we need to check if the name is a valid identifier and not a reserved word. Instead of applying the rules in separate functions, a single function has been added to avoid unexpected results.