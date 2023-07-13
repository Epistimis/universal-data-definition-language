import { ValidationAcceptor } from "langium";
import { ConceptualCompositeQuery, isConceptualCompositeQuery } from "../../generated/ast";
    
/*
* A ConceptualQueryComposition's rolename is unique within a ConceptualCompositeQuery.
* UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
* Invariant compositionsHaveUniqueRolenames
 */
export const CheckCompositionsHaveUniqueRolenames = (view: ConceptualCompositeQuery, accept: ValidationAcceptor) =>{
    if(!compositionsHaveUniqueRolenames(view)){
        accept('error', "Compositions must have unique rolenames", { node: view, property: "composition" });
    }
}
const compositionsHaveUniqueRolenames = (view: ConceptualCompositeQuery): boolean =>{
    let rolename = new Set<string>();
    view.composition.forEach(item =>{
        if(rolename.has(item.rolename)){
            return false
        }else{
            rolename.add(item.rolename)
        }
    })
    return true;
}
      
/*
* A ConceptualCompositeQuery does not compose itself.
* UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
* Invariant noCyclesInConstruction
*/
export const CheckNoCyclesInConstruction = (view: ConceptualCompositeQuery, accept: ValidationAcceptor) =>{
    if(getAllCompositeQuery(view).includes(view.name)){
        accept('error', "ConceptualCompositeQuery can not compose itself", { node: view, property: "composition" });
    } 
}
const getAllCompositeQuery = (view: ConceptualCompositeQuery ): string[]=>{
    let compositequery = new Array<string>();
    view.composition.forEach(item =>{
        if(isConceptualCompositeQuery(item.type.ref)){
           compositequery.push(item.type.ref.name);
           let compositequerythrougtype = getAllCompositeQuery(item.type.ref)
           compositequery.push(...compositequerythrougtype)
        }
    })
   return compositequery;  
}
    
/*
* A ConceptualCompositeQuery does not compose the same View more than once.
* UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
* Invariant viewComposedOnce
*/
export const CheckViewComposedOnce = (view: ConceptualCompositeQuery, accept: ValidationAcceptor) =>{
    if(!viewComposedOnce(view)){
        accept('error', "View should Compose only once", { node: view, property: "composition" });
    }   
}
const  viewComposedOnce = (view: ConceptualCompositeQuery): boolean =>{
    const views = new Set<string>();
    let result = true;
    view.composition.forEach(item =>{
        if(item.type.ref ){
            if(views.has(item.type.ref.name)){
                result = false;
            }else{
               views.add(item.type.ref.name)
            }
        }
    })
    return true;
}


