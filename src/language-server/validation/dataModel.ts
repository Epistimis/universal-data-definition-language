    import { ValidationAcceptor } from "langium";
    import { DataModel, ConceptualDataModel, LogicalDataModel, PlatformDataModel } from "../generated/ast";
    
/**
 * Every UddlElement in a DataModel has a unique name.
 * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/datamodel.ocl
 * invariant childModelsHaveUniqueNames
*/
    export const checkElementHasUniqueName = (model: DataModel, accept: ValidationAcceptor) =>{
        if( !isNameUnique(model.cdm) || !isNameUnique(model.ldm) || !isNameUnique(model.pdm) ){
         accept('error', 'This element must have unique name', {node: model, property: "name"});
        }
     }
     export const isNameUnique = (model: ConceptualDataModel[] | LogicalDataModel[] | PlatformDataModel[]): boolean =>{
         let result = true;
         let reportedin = new Set<string>();
         
         model.forEach(item =>{
             if(reportedin.has(item.name)){
                 result = false;
             }else{
                 reportedin.add(item.name)
                 
                 item.element?.forEach(elm =>{ 
                     if(reportedin.has(elm.name)){
                         result = false;
                     }else{
                         reportedin.add(elm.name)  
                     }
                 });
                 
                 if(result && 'cdm' in item && item.cdm.length){
                     result = isNameUnique(item.cdm)
                 }
                 if(result && 'ldm' in item && item.ldm.length){
                     result = isNameUnique(item.ldm)
                 }
                 if(result && 'pdm' in item && item.pdm.length){
                     result = isNameUnique(item.pdm)
                 }   
             }
         })
         return result;
     }