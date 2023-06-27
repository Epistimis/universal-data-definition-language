    import { ValidationAcceptor } from "langium";
    import { ConceptualEntity , ConceptualAssociation, ConceptualCharacteristic, ConceptualParticipant} from "../../generated/ast";
    
    /**
     * A ConceptualEntity has at least one locally defined ConceptualCharacteristic (not inherited through generalization).
     * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
     * invariant hasAtLeastOneLocalConceptualCharacteristic
     */
    export const checkForAtLeastOneLocalConceptualCharacteristic = (model: ConceptualEntity | ConceptualAssociation, accept: ValidationAcceptor) =>{
        if(!atLeastOneLocalConceptualCharacteristic(model)){
            accept('error', 'A ConceptualEntity must have at least one locally defined ConceptualCharacteristic.', {node : model, property : "composition" });
        }
    }
    export const atLeastOneLocalConceptualCharacteristic = (model: ConceptualEntity | ConceptualAssociation): boolean => {
        return getAllLocalCharacteristics(model).length >= 1;
    }
    const getAllLocalCharacteristics = (model: ConceptualEntity | ConceptualAssociation) => {
        let characteristics
        if('participant' in model){
            characteristics = [...model.participant, ...model.composition]
        }else{
            characteristics = [...model.composition]
        }
        return characteristics
    }

    /**
     * A ConceptualEntity is not a specialization of itself..
     * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
     * invariant noCyclesInSpecialization
     */
    export const checkForCyclesInSpecialization = (entity: ConceptualEntity, accept: ValidationAcceptor): void =>{
        let centityspec: Set<string> = new Set();   
        if (cyclesInSpecialization(entity, centityspec)) { 
            accept('error', 'A ConceptualEntity is not a specialization of itself.', {node: entity, property: "composition" });
        }    
    }
    export const cyclesInSpecialization = (entity: ConceptualEntity, centityspec: Set<string>): boolean =>{
        let result = false
        centityspec.add(entity?.name);
        const spec = entity.specializes?.ref;
        if(spec !== undefined) {
            if(centityspec.has(spec.name)){
                result = true;
            }else{
                result = cyclesInSpecialization(spec, centityspec); 
            }
        }
        return result;
    }

    /**
     * A ConceptualCharacteristic's rolename is unique within a ConceptualEntity..
     * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
     * invariant characteristicsHaveUniqueRolenames
    */
    export const checkCharacteristicsHaveUniqueRolenames = (model: ConceptualEntity | ConceptualAssociation, accept: ValidationAcceptor) =>{
        let report: Set<string> = new Set();
        if(!characteristicsHaveUniqueRolenames(model, report)){
            accept('error', "A ConceptualCharacteristic's role name is unique within a ConceptualEntity.", {node: model, property: "composition" });
        }
    }
    export const characteristicsHaveUniqueRolenames = (model: ConceptualEntity | ConceptualAssociation, report: Set<string>):boolean =>{
        let result = true;
        let allChar = getAllLocalCharacteristics(model);

        allChar.forEach(item =>{
            if(report.has(item.rolename)){
                result = false;
            }else{
                report.add(item.rolename)
            }
        });

        if(result && model.specializes?.ref){
            result = characteristicsHaveUniqueRolenames(model.specializes.ref, report);
        }
        return result
    }

    /**
     * A ConceptualAssociation has at least two Participants..
     * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
     * invariant hasAtLeastTwoParticipants
     */
    export const checkForAtLeastTwoParticipants = (model: ConceptualAssociation , accept: ValidationAcceptor) =>{
        const result = totalParticipants(model)
        if(result.length < 2){
            accept('error', 'A ConceptualAssociation must have at least two Participants', {node: model, property: "participant" });
        }
    }
    export const totalParticipants = (model: ConceptualAssociation | ConceptualEntity ): ConceptualParticipant[] =>{
        let result: ConceptualParticipant[] = [];  
        if('participant' in model){
            result = result.concat(model.participant)
            if(model.specializes?.ref){
                result = result.concat(totalParticipants(model.specializes?.ref))
            }
        }
        return result
    }

    /**
     * An Entity does not compose the same Observable more than once..
     * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conditional_observableComposedOnce.ocl
     * invariant observableComposedOnce
     */
    export const checkObservableComposedOnce = (entity: ConceptualEntity, accept: ValidationAcceptor) => {
        let observables: Set<string> = new Set();
        if(!observableComposedOnce(entity, observables)){
            accept('error', 'An Entity does not compose the same Observable more than once.', {node: entity , property: "name"});
        }
    }
    export const observableComposedOnce = (model: ConceptualEntity, observablecontainer: Set<string>):boolean =>{
        let result = true
        model.composition.forEach(item =>{
            if(item.type.ref?.$type === 'ConceptualObservable'){
               if(observablecontainer.has(item.type.ref?.name)){
                    result = false;
               }else{
                    observablecontainer.add(item.type.ref?.name)
               }
            }
        })
        if(result && model.specializes?.ref){
            result = observableComposedOnce(model.specializes?.ref, observablecontainer)
        }
        return result;
    }

    /**
     * A ConceptualEntity contains a ConceptualComposition whose type is a ConceptualObservable named 'Identifier'..
     * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
     * invariant hasUniqueID
     */
    export const checkForUniqueID = (entity: ConceptualEntity, accept: ValidationAcceptor) =>{
        let observables: Set<string> = new Set();
        if(!uniqueID(entity, observables)){
            accept('error', 'A ConceptualEntity must contains a ConceptualComposition whose type is a ConceptualObservable named  "Identifier"', {node: entity , property: "name"});  
        }
    }
    export const uniqueID =(entity: ConceptualEntity, observables: Set<string>): boolean =>{
        let hasID = false;
        entity.composition.forEach(item =>{
            if(item.type.ref?.$type === 'ConceptualObservable'){
                if(item.type.ref?.name.toLocaleLowerCase() === 'identifier'){
                   hasID = true;  
                }
            }
        });
        if(!hasID && entity.specializes?.ref){
            hasID = uniqueID(entity.specializes?.ref, observables);
        }
        return hasID;
    }

   /**
    * If ConceptualEntity A' specializes ConceptualEntity A, all characteristics
    * in A' specialize either nothing, characteristics from A,
    * or characteristics from a ConceptualEntity that is a generalization of A.
    * (If A' does not specialize, none of its characteristics specialize.)
    * UDDL/com.epistimis.uddl/src/com/epistimis/uddl/constraints/conceptual.ocl
    * invariant specializingConceptualCharacteristicsConsistent
    */   
    export const checkSpecializingConceptualCharacteristicsConsistent = (model: ConceptualEntity, accept: ValidationAcceptor) => {
        if (!specializingConceptualCharacteristicsConsistent(model)) {
          accept('error', "Specializing ConceptualCharacteristics must be consistent", { node: model, property: "composition" });
        }
    };
      
    export const specializingConceptualCharacteristicsConsistent = (model: ConceptualEntity | ConceptualAssociation, char?: ConceptualCharacteristic[]): boolean => {
        let characteristics = getAllLocalCharacteristics(model);
        characteristics = characteristics.filter(elm => elm.specializes?.ref);
        let result = false;
      
        if (!model.specializes?.ref) {
          result = characteristics.length === 0;
        } else {
          if (characteristics.length > 0) {
            //if called with array of characteristics in recursive call
            if (char?.length) {
              //check if all characteristics specialize
              result = char.every(c =>
                characteristics.some(sc => sc.specializes?.ref === c.specializes?.ref)
              );
            }
            if (!result) {
              result = specializingConceptualCharacteristicsConsistent(model.specializes?.ref, char);
            }
          } else {
            result = true;
          }
        }
        return result;
    };