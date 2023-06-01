import { ValidationAcceptor} from 'langium';

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

export const centity1:unknown = {
  name:'entityab',
  composition: [concomposition1],
  basisEntity:[conbasis1,conbasis2]
};

export const centity2:unknown = {
  name:'entitybc',
  composition: [concomposition1, concomposition2],
  specializes:{ref:centity1},
  basisEntity:[conbasis1,conbasis2]
};

export const centity3:unknown = {
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
  discription:'',
  composition:[concomposition1,concomposition2],
  specializes:{ref:{centity1}},
  participant:cparticipent1 
};

interface dm extends cdm,ldm,pdm {};

interface cdm  {
  cdm:cdm[],
  name:string,  
};

interface ldm  {
  ldm:ldm[],
  name:string,  
};

interface pdm  {
    pdm:pdm[],
    name:string,  
};

export const elm:dm = {
  name:'test',
  cdm:[{name:'x',cdm:[{name:'a',cdm:[{name:'b',cdm:[{name:'c',cdm:[{name:'d',cdm:[]}]}]},{name:'d',cdm:[]}]}]}],
  ldm:[{name:'x',ldm:[{name:'a',ldm:[{name:'b',ldm:[{name:'c',ldm:[{name:'d',ldm:[]}]}]},{name:'e',ldm:[]}]}]}],
  pdm:[{name:'x',pdm:[{name:'a',pdm:[{name:'b',pdm:[{name:'c',pdm:[{name:'d',pdm:[]}]}]},{name:'d',pdm:[]}]}]}]
};