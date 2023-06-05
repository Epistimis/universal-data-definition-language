import { ValidationAcceptor} from 'langium';

// For testing the validation function of an ast node, need to define some dummy objects replicating the property of the ast node. 
//So created this file to contain all the dummy objects.

export const accept: ValidationAcceptor = () => {};

export const conobservable1 = {
  name: 'observab',
  description: 'this is ab'
};

export const conobservable2 = {
  name: 'obvervbc',
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

export const concomposition1 = {
  type:conobservable1,
  rolename:'compoab',
  upperBound:2,
  lowerBound:1,
  description:"this is ab"
};

export const concomposition2 = {
  type:conobservable2,
  rolename:'compobc',
  upperBound:2,
  lowerBound:1,
  description:"this is bc"
};

export const centity1:any = {
  name:'entityab',
  composition: [concomposition1],
  basisEntity:[conbasis1,conbasis2]
};

export const centity2:any = {
  name:'entitybc',
  composition: [concomposition1, concomposition2],
  specializes:{ref:centity1},
  basisEntity:[conbasis1,conbasis2]
};

export const centity3:any = {
  name:'entityab',
  composition: [concomposition1],
  specializes:{ref:centity2},
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
  type:{ref:centity1},
  rolename:'',
  lowerBound:2,
  upperBound:1,
  description:'',
  specializes:{ref:concomposition2},
  sourceLowerBound:2,
  sourceUpperBound:1,
  path:concharpathnode1
};

export const conparpathnode1 = {
  node:concharpathnode2,
  projectedParticipant:{ref:cparticipent1}
};

export const cassoc1 = {
  name:'entityab',
  description:'',
  composition:[concomposition1,concomposition2],
  specializes:{ref:{centity1}},
  participant:cparticipent1 
};

//interface dm extends cdm {};

// interface cdm  {
//   cdm:cdm[],
//   name:string,
//   elms:any[]
// };

// interface ldm  {
//   ldm:ldm[],
//   name:string,  
// };

// interface pdm  {
//     pdm:pdm[],
//     name:string,  
// };

export const elm= {
  name:'test',
  cdm:[{name:'a',
        cdm:[{name:'b',
              cdm:[{name:'c',
                    cdm:[{name:'d',
                          cdm:[],
                          elms:[conbasis1,conobservable1, centity1]
                        }],
                    elms:[conbasis2,conobservable2, centity2]
                  }],
              elms:[conbasis1,conobservable1, centity1]
             }],
        elms:[conbasis2,conobservable2, centity2]
  }],
  ldm:[{name:'e',
        ldm:[{name:'e',
               ldm:[],
               elms:[conbasis1,conobservable1, centity1]
              }],
        elms:[conbasis2,conobservable2, centity2]
  }],
  pdm:[{name:'g',
        pdm:[{name:'h',
              pdm:[],
              elms:[conbasis1,conobservable1, centity1]
            }],
        elms:[conbasis2,conobservable2, centity3]
  }],

};

