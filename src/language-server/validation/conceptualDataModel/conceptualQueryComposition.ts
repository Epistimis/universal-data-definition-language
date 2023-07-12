import { ValidationAcceptor } from "langium";
import { ConceptualQueryComposition} from "../../generated/ast";
import { isValidIdentifier } from "../uddlElement";

/*
* The rolename of a ConceptualQueryComposition is a valid identifier.
* UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
* Invariant rolenameIsValidIdentifier
*/
export const checkRolenameIsValidIdentifier = (model: ConceptualQueryComposition, accept: ValidationAcceptor)=>{
    if(isValidIdentifier(model.rolename)){
        accept('error', "The rolename of a ConceptualQueryComposition must be a valid identifier", { node: model, property: "rolename" });
    }
}