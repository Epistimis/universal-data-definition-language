import { ValidationAcceptor} from 'langium';

// For testing the validation function of an ast node, need to define some dummy objects replicating the property of the ast node. 
//So created this file to contain all the dummy objects.

export const accept: ValidationAcceptor = () => {};

export const conobservable1 = {
  $type: 'ConceptualObservable',
  name: 'observab',
  description: 'this is ab'
};

export const conobservable2 = {
  $type: 'ConceptualObservable',
  name: 'obvervbc',
  
  description: 'this is bc'
};

export const conobservable3 = {
  $type: 'ConceptualObservable',
  name: 'Identifier',
  description: 'this is bc'
};

export const conobservable4 = {
  $type: 'ConceptualObservable',
  name: 'obseref',
 
  description: 'this is bc'
};

export const conbasis1 = {
  name: 'basisab',
  description: 'this is ab'
};

export const conbasis2 = {
  name: 'basisbc',
  description: 'this is bc'
};

export const condomain1 ={
  name: 'domainab',
  description: 'this is ab'
};

export const condomain2 = {
  name: 'domainbc',
  description: 'this is bc'
};

export const concomposition1: unknown = {
  type:{ref: conobservable1},
  rolename:'compoab',
  upperBound:1,
  lowerBound:1,
  description:"this is ab"
};

export const concomposition2: unknown = {
  type:{ref: conobservable2},
  rolename:'compobc',
  upperBound:0,
  lowerBound:1,
  description:"this is bc"
};

export const concomposition3: unknown = {
  type:{ref: conobservable3},
  rolename:'compocd',
  upperBound:-1,
  lowerBound:-1,
  specializes:{ref:concomposition2},
  description:"this is bc"
};

export const concomposition4: unknown = {
  type:{ref: conobservable2},
  rolename:'compocd',
  upperBound:2,
  lowerBound:4,

  description:"this is bc"
};

export const centity1:any = {
  name:'entityab',
  composition: [],
  basisEntity:[conbasis1,conbasis2]
};

export const centity2:any = {
  name:'entitybc',
  composition: [ concomposition1,concomposition4],
  specializes:{ref:centity1},
  basisEntity:[conbasis1,conbasis2]
};

export const centity3:any = {
  name:'entityab',
  composition: [concomposition3,concomposition4],
  specializes:{ref:centity2},
  basisEntity:[conbasis1,conbasis2]
};

export const centity4:any = {
  name:'entityef',
  composition: [concomposition3,concomposition3],
  specializes:{ref:centity1},
  basisEntity:[conbasis1,conbasis2]
};

export const concharpathnode1 = {
  projectedCharacteristic:concomposition1
};

export const concharpathnode2 = {
  node:concharpathnode1,
  projectedParticipant:{ref:concomposition2}
};

export const cparticipent1 = {
  type:{ref:centity3},
  rolename:'roleab',
  lowerBound:2,
  upperBound:1,
  description:'',
  specializes:{ref:concomposition2},
  sourceLowerBound:2,
  sourceUpperBound:1,
  path:concharpathnode1
};

export const cparticipent2 = {
  type:{ref:centity4},
  rolename:'rolebc',
  lowerBound:-1,
  upperBound:0,
  description:'',
  specializes:{ref:concomposition3},
  sourceLowerBound:4,
  sourceUpperBound:1,
  path:concharpathnode1
};

export const conparpathnode1 = {
  node:concharpathnode2,
  projectedParticipant:{ref:cparticipent1}
};

export const cassoc1:any = {
  name:'assoab',
  description:'',
  composition:[concomposition1,concomposition2,concomposition3],
  specializes:{ref:centity2},
  participant:[cparticipent1]
};

export const cassoc2:any = {
  name:'assobc',
  description:'',
  composition:[concomposition3],
  specializes:{ref:centity3},
  participant:[cparticipent1,cparticipent2]
};

export const datamodel: unknown= {
  cdm:[{name:'a',
        cdm:[{name:'b',
              cdm:[],
              element:[]
             }],
             element:[]
  }],
  ldm:[{name:'e',
        ldm:[{name:'e',
               ldm:[],
               element:[conbasis1,conobservable1]
              },
              {name:'e',
               ldm:[],
               element:[conbasis1,conobservable1]
              }
            ],
        elms:[conbasis2,conobservable2, centity2]
  }],
  pdm:[{name:'g',
        pdm:[{name:'h',
              pdm:[],
              element:[conbasis1,conobservable1, centity1]
            }],
        element:[conbasis2,conobservable2, centity3]
  }],

};

