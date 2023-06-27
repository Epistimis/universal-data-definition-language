import { ValidationAcceptor } from "langium";
import { ConceptualComposition, ConceptualEntity} from "../../generated/ast";

/**
 * If a ConceptualComposition specializes, it specializes a ConceptualComposition.
 * If ConceptualComposition "A" specializes ConceptualComposition "B",
 * then A's type is B's type or a specialization of B's type.
 * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
 * invariant typeConsistentWithSpecialization
 */
export const checkTypeConsistentWithSpecialization = (model: ConceptualComposition, accept: ValidationAcceptor) => {
    if (typeConsistentWithSpecialization(model)) {
        accept('error', "Type must be consistent with specialization", { node: model, property: "specializes" });
    }
}

export const typeConsistentWithSpecialization = (model: ConceptualComposition): boolean => {
    let result = false;
    if (model.specializes?.ref) {
        if (model.specializes.ref.$type === 'ConceptualComposition') {
            if (model.type.ref === model.specializes.ref.type.ref) {
                result = true;
            } else {
                // Check if A's type is a specialization of B's type
                if ('specializes' in model.type.ref! && 'specializes' in model.specializes.ref.type.ref!) {
                    result = isSpecializationOf(model.specializes?.ref.type.ref!, model.type.ref!);
                }
            }
        }
    }
    return result;
}

export const isSpecializationOf = (spec: ConceptualEntity, model: ConceptualEntity): boolean => {
    let result = false;
    if (spec.specializes?.ref?.name === model.name) {
        result = true;
    } else {
        result = isSpecializationOf(spec.specializes?.ref!, model);
    }
    return result;
}
