grammar UniversalDataDefinitionLanguage
//import 'terminals'

// Starter rule comes first

entry File:
    (include+=Include)*
    model+=DataModel+
    ;



DataModel infers DataModel:
    'dm' name=ID  (description=STRING )? '{' (cdm+=ConceptualDataModel  | ldm+=LogicalDataModel  | pdm+=PlatformDataModel  )*'}'  
;

QN returns string:
    ID ('.' ID )*  
;

Include infers Include:
    'include' importedNamespace=QualifiedNameWithWildcard   
;

QualifiedNameWithWildcard returns string:
    QN '.*'?  
;

UddlElement infers UddlElement:
    DataModel | ConceptualDataModel | LogicalDataModel | PlatformDataModel | ConceptualElement | LogicalElement | PlatformElement | LogicalReferencePoint | LogicalEnumerationLabel | LogicalConstraint 
;

ConceptualDataModel infers ConceptualDataModel:
    'cdm' name=ID  (description=STRING )? '{' (element+=ConceptualElement  | cdm+=ConceptualDataModel  )*'}'  
;

LogicalDataModel infers LogicalDataModel:
    'ldm' name=ID  (description=STRING )? '{' (element+=LogicalElement  | ldm+=LogicalDataModel  )*'}'  
;

PlatformDataModel infers PlatformDataModel:
    'pdm' name=ID  (description=STRING )? '{' (element+=PlatformElement  | pdm+=PlatformDataModel  )*'}'  
;

ConceptualElement infers ConceptualElement:
    ConceptualDomain | ConceptualBasisEntity | ConceptualComposableElement | ConceptualView 
;

ConceptualComposableElement infers ConceptualComposableElement:
    ConceptualEntity | ConceptualObservable 
;

ConceptualBasisEntity infers ConceptualBasisEntity:
    'basis' name=ID  (description=STRING )? ';'  
;

ConceptualDomain infers ConceptualDomain:
    'domain' name=ID  (description=STRING )? ';'  
;

ConceptualObservable infers ConceptualObservable:
    'observable' name=ID  (description=STRING )? ';'  
;

ConceptualCharacteristic infers ConceptualCharacteristic:
    ConceptualComposition | ConceptualParticipant 
;

ConceptualEntity infers ConceptualEntity:
    ConceptualAssociation | 'centity' name=ID  (description=STRING )? (':' specializes=[ConceptualEntity:QN ] )? '{' composition+=ConceptualComposition * ('basis:' '[' basisEntity+=[ConceptualBasisEntity:QN ]+ ']' )? '};'  
;

ConceptualComposition infers ConceptualComposition:
    ^type=[ConceptualComposableElement:QN ] rolename=ID  ('[' (lowerBound=INT )? ':' (upperBound=INT )? ']' )? (description=STRING )? (':' specializes=[ConceptualCharacteristic:QN ] )? ';'  
;

ConceptualAssociation infers ConceptualAssociation:
    'cassoc' name=ID  (description=STRING )? (':' specializes=[ConceptualEntity:QN ] )? '{' composition+=ConceptualComposition * ('basis:' '[' ConceptualBasisEntity+=[ConceptualBasisEntity:QN ]+ ']' )? ('participants:' '[' participant+=ConceptualParticipant + ']' )? '};'  
;

ConceptualParticipant infers ConceptualParticipant:
    ^type=[ConceptualEntity:QN ] rolename=ID  ('[' (lowerBound=INT )? ':' (upperBound=INT )? ']' )? (description=STRING )? (':' specializes=[ConceptualCharacteristic:QN ] )? '{' 'src:' '[' sourceLowerBound=INT  ':' sourceUpperBound=INT  ']' ('path:' path=ConceptualPathNode  )? '}' ';'  
;

ConceptualPathNode infers ConceptualPathNode:
    ConceptualParticipantPathNode | ConceptualCharacteristicPathNode 
;

ConceptualParticipantPathNode infers ConceptualParticipantPathNode:
    '/' projectedParticipant=[ConceptualParticipant:QN ] (node=ConceptualPathNode )?  
;

ConceptualCharacteristicPathNode infers ConceptualCharacteristicPathNode:
    '#' projectedCharacteristic=[ConceptualCharacteristic:QN ] (node=ConceptualPathNode )?  
;

ConceptualView infers ConceptualView:
    ConceptualQuery | ConceptualCompositeQuery 
;

ConceptualQuery infers ConceptualQuery:
    'cquery' name=ID  (description=STRING )? '{' 'spec:' specification=STRING  '};'  
;

ConceptualCompositeQuery infers ConceptualCompositeQuery:
    'ccquery' name=ID  (description=STRING )? '{' isUnion?='isUnion'  composition+=ConceptualQueryComposition  (composition+=ConceptualQueryComposition )+ '};'  
;

ConceptualQueryComposition infers ConceptualQueryComposition:
    ^type=[ConceptualView:QN ] rolename=ID  ';'  
;

LogicalElement infers LogicalElement:
    LogicalComposableElement | LogicalConversion | LogicalUnit | LogicalCoordinateSystem | LogicalCoordinateSystemAxis | LogicalMeasurementConversion | LogicalMeasurementSystemConversion | LogicalMeasurementAxis | LogicalAbstractMeasurementSystem | LogicalMeasurementSystemAxis | LogicalValueType | LogicalView | LogicalLandmark | LogicalValueTypeUnit 
;

LogicalUnit infers LogicalUnit:
    'lunit' name=ID  (description=STRING )? ';'  
;

LogicalConversion infers LogicalConversion:
    'conv' name=ID  (description=STRING )? '{' source=[LogicalAssociation:QN ] '->' destination=[LogicalAssociation:QN ] '};'  | LogicalAffineConversion 
;

LogicalAffineConversion infers LogicalAffineConversion:
    'aconv' name=ID  (description=STRING )? '{' source=[LogicalAssociation:QN ] '-(' conversionFactor=FLOAT  ',' offset=FLOAT  ')->' destination=[LogicalAssociation:QN ] '};'  
;

LogicalValueType infers LogicalValueType:
    LogicalBoolean | LogicalNumeric | LogicalCharacter | LogicalString | LogicalEnumeratedBase 
;

LogicalString infers LogicalString:
    'str' name=ID  (description=STRING )? ';'  
;

LogicalCharacter infers LogicalCharacter:
    'char' name=ID  (description=STRING )? ';'  
;

LogicalBoolean infers LogicalBoolean:
    'bool' name=ID  (description=STRING )? ';'  
;

LogicalNumeric infers LogicalNumeric:
    LogicalInteger | LogicalNatural | LogicalReal | LogicalNonNegativeReal 
;

LogicalInteger infers LogicalInteger:
    'int' name=ID  (description=STRING )? ';'  
;

LogicalNatural infers LogicalNatural:
    'nat' name=ID  (description=STRING )? ';'  
;

LogicalReal infers LogicalReal:
    'real' name=ID  (description=STRING )? ';' 	
;

LogicalNonNegativeReal infers LogicalNonNegativeReal:
    'real+' name=ID  (description=STRING )? ';'  
;

LogicalEnumerated infers LogicalEnumerated:
    'enum' name=ID  (description=STRING )? ('stdRef:' standardReference=STRING  )? '[' label+=(LogicalEnumerationLabel | LogicalEnumeratedSet ) ','? (label+=(LogicalEnumerationLabel | LogicalEnumeratedSet ) ','? )* ']' ';'  
;

Taxonomy infers Taxonomy:
    LogicalEnumeratedBase 
;

LogicalEnumeratedBase infers LogicalEnumeratedBase:
    LogicalEnumeratedSet | LogicalEnumerationLabel | LogicalEnumerated 
;

LogicalEnumeratedSet infers LogicalEnumeratedSet:
    '{' name=ID  (description=STRING )? '[' label+=(LogicalEnumerationLabel | LogicalEnumeratedSet ) ','? (label+=(LogicalEnumerationLabel | LogicalEnumeratedSet ) ','? )* ']' '}'  
;

LogicalEnumerationLabel infers LogicalEnumerationLabel:
    name=ID  | '(' name=ID  description=STRING  ')'  
;

LogicalCoordinateSystem infers LogicalCoordinateSystem:
    'coord' name=ID  (description=STRING )? '{' ('axis:' axisRelationshipDescription=STRING  )? ('angleEq:' angleEquation=STRING  )? ('distanceEq:' distanceEquation=STRING  )? '[' axis+=[LogicalCoordinateSystemAxis:QN ]+ ']' '};'  
;

LogicalCoordinateSystemAxis infers LogicalCoordinateSystemAxis:
    'csa' name=ID  (description=STRING )? ';'  
;

LogicalAbstractMeasurementSystem infers LogicalAbstractMeasurementSystem:
    LogicalStandardMeasurementSystem | LogicalMeasurementSystem 
;

LogicalStandardMeasurementSystem infers LogicalStandardMeasurementSystem:
    'smsys' name=ID  (description=STRING )? '{' 'refStd:' referenceStandard=STRING  '};'  
;

LogicalLandmark infers LogicalLandmark:
    'landmark' name=ID  (description=STRING )? ';'  
;

LogicalMeasurementSystem infers LogicalMeasurementSystem:
    'msys' name=ID  (description=STRING )? '{' 'maxis:' '[' measurementSystemAxis+=[LogicalMeasurementSystemAxis:QN ]+ ']' 'coord:' coordinateSystem=[LogicalCoordinateSystem:QN ] ('extRefStd:' externalStandardReference=STRING  )? ('orient:' orientation=STRING  )? ('refPt:' '[' referencePoint+=LogicalReferencePoint + ']' )? ('![' constraint+=LogicalMeasurementConstraint + ']' )? '};'  
;

LogicalMeasurementSystemAxis infers LogicalMeasurementSystemAxis:
    'msa' name=ID  (description=STRING )? '{' 'axis:' axis=[LogicalCoordinateSystemAxis:QN ] 'vtu:' '[' defaultValueTypeUnit+=[LogicalValueTypeUnit:QN ]+ ']' ('![' constraint+=LogicalMeasurementConstraint + ']' )? '};'  
;

LogicalReferencePoint infers LogicalReferencePoint:
    '(' name=ID  (description=STRING )? 'landmark:' landmark=[LogicalLandmark:QN ] '[' referencePointPart+=LogicalReferencePointPart + ']' ')'  
;

LogicalReferencePointPart infers LogicalReferencePointPart:
    '(' (axis=[LogicalMeasurementSystemAxis:QN ])? value=STRING  (valueTypeUnit=[LogicalValueTypeUnit:QN ])? ')'  
;

LogicalValueTypeUnit infers LogicalValueTypeUnit:
    'vtu' valueType=[LogicalValueType:QN ] unit=[LogicalUnit:QN ] name=ID  (description=STRING )? ('{' '!' constraint=LogicalConstraint  '}' )? ';'  
;

LogicalConstraint infers LogicalConstraint:
    LogicalStringConstraint | LogicalRealRangeConstraint | LogicalIntegerRangeConstraint | LogicalEnumerationConstraint 
;

LogicalIntegerRangeConstraint infers LogicalIntegerRangeConstraint:
    'irc' name=ID  '[' lowerBound=INT  ':' upperBound=INT  ']' (description=STRING )? ';'  
;

LogicalRealRangeConstraint infers LogicalRealRangeConstraint:
    'rrc' name=ID  ('(' | lowerBoundInclusive?='['  )lowerBound=FLOAT  ':' upperBound=FLOAT  (')' | upperBoundInclusive?=']'  )(description=STRING )? ';'  
;

LogicalStringConstraint infers LogicalStringConstraint:
    LogicalRegularExpressionConstraint | LogicalFixedLengthStringConstraint 
;

LogicalRegularExpressionConstraint infers LogicalRegularExpressionConstraint:
    'rec' name=ID  '[' expression=STRING  ']' (description=STRING )? ';'  
;

LogicalFixedLengthStringConstraint infers LogicalFixedLengthStringConstraint:
    'flsc' name=ID  '[' length=INT  ']' (description=STRING )? ';'  
;

LogicalEnumerationConstraint infers LogicalEnumerationConstraint:
    { infer LogicalEnumerationConstraint} 'ec' name=ID  (description=STRING )? ('[' (allowedValue+=[LogicalEnumerationLabel:QN ])+ ']' )?  
;

LogicalMeasurementConstraint infers LogicalMeasurementConstraint:
    constraintText=STRING  
;

LogicalMeasurementSystemConversion infers LogicalMeasurementSystemConversion:
    'msc' name=ID  (description=STRING )? '{' source=[LogicalMeasurementSystem:QN ] '->' destination=[LogicalMeasurementSystem:QN ] 'eqn:' '[' equation+=STRING  (',' equation+=STRING  )? ']' 'loss:' conversionLossDescription=STRING  '};'  
;

LogicalMeasurement infers LogicalMeasurement:
    'meas' name=ID  (description=STRING )? '->' realizes=[ConceptualObservable:QN ] '{' attribute+=LogicalMeasurementAttribute * ('axis:' '[' measurementAxis+=[LogicalMeasurementAxis:QN ]+ ']' )? 'sys:' measurementSystem=[LogicalAbstractMeasurementSystem:QN ] ('![' constraint+=LogicalMeasurementConstraint  ']' )? '};'  
;

LogicalMeasurementAxis infers LogicalMeasurementAxis:
    'maxis' name=ID  (description=STRING )? ('->' realizes=[ConceptualObservable:QN ] )? '{' ('vtu:' '[' valueTypeUnit+=[LogicalValueTypeUnit:QN ]+ ']' )? 'msaxis:' measurementSystemAxis=[LogicalMeasurementSystemAxis:QN ] ('![' constraint+=LogicalMeasurementConstraint + ']' )? '};'  
;

LogicalMeasurementAttribute infers LogicalMeasurementAttribute:
    ^type=[LogicalMeasurement:QN ] rolename=ID   
;

LogicalMeasurementConversion infers LogicalMeasurementConversion:
    'mc' name=ID  (description=STRING )? '{' source=[LogicalMeasurementSystem:QN ] '->' destination=[LogicalMeasurementSystem:QN ] 'eqn:' '[' equation+=STRING  (',' equation+=STRING  )? ']' 'loss:' conversionLossDescription=STRING  '};'  
;

LogicalComposableElement infers LogicalComposableElement:
    LogicalEntity | LogicalMeasurement 
;

LogicalCharacteristic infers LogicalCharacteristic:
    LogicalComposition | LogicalParticipant 
;

LogicalEntity infers LogicalEntity:
    'lentity' name=ID  (description=STRING )? (':' specializes=[LogicalEntity:QN ] )? '->' realizes=[ConceptualEntity:QN ] '{' composition+=LogicalComposition * '};'  | LogicalAssociation 
;

LogicalComposition infers LogicalComposition:
    ^type=[LogicalComposableElement:QN ] rolename=ID  ('[' lowerBound=INT  ':' upperBound=INT  ']' )? (description=STRING )? (':' specializes=[LogicalCharacteristic:QN ] )? '->' realizes=[ConceptualComposition:QN ] ';'  
;

LogicalAssociation infers LogicalAssociation:
    'lassoc' name=ID  (description=STRING )? (':' specializes=[LogicalEntity:QN ] )? '->' realizes=[ConceptualEntity:QN ] '{' composition+=LogicalComposition * ('participants:' '[' participant+=LogicalParticipant + ']' )? '};'  
;

LogicalParticipant infers LogicalParticipant:
    ^type=[LogicalAssociation:QN ] rolename=ID  ('[' lowerBound=INT  ':' upperBound=INT  ']' )? (description=STRING )? (':' specializes=[LogicalCharacteristic:QN ] )? '->' realizes=[ConceptualParticipant:QN ] '{' 'source:' '[' sourceLowerBound=INT  ':' sourceUpperBound=INT  ']' ('path:' path=LogicalPathNode  )? '};'  
;

LogicalPathNode infers LogicalPathNode:
    LogicalParticipantPathNode | LogicalCharacteristicPathNode 
;

LogicalParticipantPathNode infers LogicalParticipantPathNode:
    '/' projectedParticipant=[LogicalParticipant:QN ] (node=LogicalPathNode )  
;

LogicalCharacteristicPathNode infers LogicalCharacteristicPathNode:
    '#' projectedCharacteristic=[LogicalCharacteristic:QN ] (node=LogicalPathNode )  
;

LogicalView infers LogicalView:
    LogicalQuery | LogicalCompositeQuery 
;

LogicalQuery infers LogicalQuery:
    'lquery' name=ID  (description=STRING )? ('->' realizes=[ConceptualQuery:QN ] )? '{' 'spec:' specification=STRING  '};'  
;

LogicalCompositeQuery infers LogicalCompositeQuery:
    'lcquery' name=ID  (description=STRING )? ('->' realizes=[ConceptualCompositeQuery:QN ] )? '{' isUnion?='isUnion'  composition+=LogicalQueryComposition  '};'  
;

LogicalQueryComposition infers LogicalQueryComposition:
    ^type=[LogicalView:QN ] rolename=ID  ('->' realizes=[ConceptualQueryComposition:QN ] )?  
;

PlatformElement infers PlatformElement:
    PlatformComposableElement | PlatformView 
;

PlatformComposableElement infers PlatformComposableElement:
    PlatformEntity | PlatformDataType 
;

PlatformDataType infers PlatformDataType:
    PlatformPrimitive | PlatformStruct 
;

PlatformPrimitive infers PlatformPrimitive:
    PlatformSequence | PlatformBoolean | PlatformCharType | PlatformNumber | PlatformOctet | PlatformEnumeration | PlatformStringType | PlatformArray 
;

PlatformBoolean infers PlatformBoolean:
    'bool' name=ID  (description=STRING )? '->' realizes=[LogicalElement:QN ] ';'  
;

PlatformOctet infers PlatformOctet:
    'octet' name=ID  (description=STRING )? '->' realizes=[LogicalElement:QN ] ';'  
;

PlatformCharType infers PlatformCharType:
    PlatformChar | PlatformWChar 
;

PlatformChar infers PlatformChar:
    'char' name=ID  (description=STRING )? '->' realizes=[LogicalElement:QN ] ';'  
;

PlatformWChar infers PlatformWChar:
    'wchar' name=ID  (description=STRING )? '->' realizes=[LogicalElement:QN ] ';'  
;

PlatformStringType infers PlatformStringType:
    PlatformString | PlatformBoundedString | PlatformCharArray 
;

PlatformString infers PlatformString:
    'string' name=ID  (description=STRING )? '->' realizes=[LogicalElement:QN ] ';'  
;

PlatformBoundedString infers PlatformBoundedString:
    'string[' maxLength=INT  ']' name=ID  (description=STRING )? '->' realizes=[LogicalElement:QN ] ';'  
;

PlatformCharArray infers PlatformCharArray:
    'char[' length=INT  ']' name=ID  (description=STRING )? '->' realizes=[LogicalElement:QN ] ';'  
;

PlatformEnumeration infers PlatformEnumeration:
    'enum' name=ID  (description=STRING )? '->' realizes=[LogicalElement:QN ] ';'  
;

PlatformNumber infers PlatformNumber:
    PlatformReal | PlatformInteger 
;

PlatformInteger infers PlatformInteger:
    PlatformLong | PlatformShort | PlatformUnsignedInteger | PlatformLongLong 
;

PlatformShort infers PlatformShort:
    'short' name=ID  (description=STRING )? '->' realizes=[LogicalElement:QN ] ';'  
;

PlatformLong infers PlatformLong:
    'long' name=ID  (description=STRING )? '->' realizes=[LogicalElement:QN ] ';'  
;

PlatformLongLong infers PlatformLongLong:
    'llong' name=ID  (description=STRING )? '->' realizes=[LogicalElement:QN ] ';'  
;

PlatformReal infers PlatformReal:
    PlatformFixed | PlatformFloat | PlatformDouble | PlatformLongDouble 
;

PlatformDouble infers PlatformDouble:
    'double' name=ID  (description=STRING )? '->' realizes=[LogicalElement:QN ] ';'  
;

PlatformLongDouble infers PlatformLongDouble:
    'ldouble' name=ID  (description=STRING )? '->' realizes=[LogicalElement:QN ] ';'  
;

PlatformFloat infers PlatformFloat:
    'float' name=ID  (description=STRING )? '->' realizes=[LogicalElement:QN ] ';'  
;

PlatformFixed infers PlatformFixed:
    'fixed[' digits=INT  '.' scale=INT  ']' name=ID  (description=STRING )? '->' realizes=[LogicalElement:QN ] ';'  
;

PlatformUnsignedInteger infers PlatformUnsignedInteger:
    PlatformUShort | PlatformULong | PlatformULongLong 
;

PlatformUShort infers PlatformUShort:
    'ushort' name=ID  (description=STRING )? '->' realizes=[LogicalElement:QN ] ';'  
;

PlatformULong infers PlatformULong:
    'ulong' name=ID  (description=STRING )? '->' realizes=[LogicalElement:QN ] ';'  
;

PlatformULongLong infers PlatformULongLong:
    'ullong' name=ID  (description=STRING )? '->' realizes=[LogicalElement:QN ] ';'  
;

PlatformSequence infers PlatformSequence:
    'seq' ('[' maxSize=INT  ']' )? name=ID  (description=STRING )? '->' realizes=[LogicalElement:QN ] ';'  
;

PlatformArray infers PlatformArray:
    'arr' ('[' size=INT  ']' )? name=ID  (description=STRING )? '->' realizes=[LogicalElement:QN ] ';'  
;

PlatformStruct infers PlatformStruct:
    'struct' name=ID  (description=STRING )? '->' realizes=[LogicalElement:QN ] '{' member+=PlatformStructMember  member+=PlatformStructMember  (member+=PlatformStructMember )? '}'  
;

PlatformStructMember infers PlatformStructMember:
    ^type=[PlatformDataType:QN ] rolename=ID  '(' precision=FLOAT  ')' ('->' realizes=[LogicalMeasurementAttribute:QN ] ';' )?  
;

PlatformCharacteristic infers PlatformCharacteristic:
    PlatformComposition | PlatformParticipant 
;

PlatformEntity infers PlatformEntity:
    'pentity' name=ID  (description=STRING )? (':' specializes=[PlatformEntity:QN ] )? '->' realizes=[LogicalEntity:QN ] '{' composition+=PlatformComposition * '};'  | PlatformAssociation 
;

PlatformComposition infers PlatformComposition:
    ^type=[PlatformComposableElement:QN ] rolename=ID  ('[' lowerBound=INT  ':' upperBound=INT  ']' )? (description=STRING )? (':' specializes=[PlatformCharacteristic:QN ] )? '->' realizes=[LogicalComposition:QN ] ('{' 'prec:' precision=FLOAT  '}' )? ';'  
;

PlatformAssociation infers PlatformAssociation:
    'passoc' name=ID  (description=STRING )? (':' specializes=[PlatformEntity:QN ] )? '->' realizes=[LogicalEntity:QN ] '{' composition+=PlatformComposition * ('participants:' '[' participant+=PlatformParticipant + ']' )? '};'  
;

PlatformParticipant infers PlatformParticipant:
    ^type=[PlatformAssociation:QN ] rolename=ID  ('[' lowerBound=INT  ':' upperBound=INT  ']' )? (description=STRING )? (':' specializes=[PlatformCharacteristic:QN ] )? '->' realizes=[LogicalParticipant:QN ] '{' 'source:' '[' sourceLowerBound=INT  ':' sourceUpperBound=INT  ']' ('path:' path=PlatformPathNode  )? '};'  
;

PlatformPathNode infers PlatformPathNode:
    PlatformParticipantPathNode | PlatformCharacteristicPathNode 
;

PlatformParticipantPathNode infers PlatformParticipantPathNode:
    '/' projectedParticipant=[PlatformParticipant:QN ] (node=PlatformPathNode )  
;

PlatformCharacteristicPathNode infers PlatformCharacteristicPathNode:
    '#' projectedCharacteristic=[PlatformCharacteristic:QN ] (node=PlatformPathNode )  
;

PlatformView infers PlatformView:
    PlatformQuery | PlatformCompositeQuery 
;

PlatformQuery infers PlatformQuery:
    'pquery' name=ID  (description=STRING )? ('->' realizes=[LogicalQuery:QN ] )? '{' 'spec:' specification=STRING  '};'  
;

PlatformCompositeQuery infers PlatformCompositeQuery:
    'pcquery' name=ID  (description=STRING )? ('->' realizes=[LogicalQuery:QN ] )? '{' isUnion?='isUnion'  composition+=PlatformQueryComposition  '};'  
;

PlatformQueryComposition infers PlatformQueryComposition:
    ^type=[PlatformView:QN ] rolename=ID  ('->' realizes=[LogicalQueryComposition:QN ] )?  
;

terminal ID returns string:'^'? ('a' ..'z' | 'A' ..'Z' | '_' )('a' ..'z' | 'A' ..'Z' | '_' | '0' ..'9' )* ;
terminal STRING returns string:'"' ('\\' . |  !('\\' | '"' ))*'"'  | "'" ('\\' . |  !('\\' | "'" ))*"'"  ;
terminal INT returns number:'0' ..'9' +;
terminal DEC returns string:'0' ..'9' +;
//terminal INT returns number:('+' | '-' )?DEC  ;
terminal FLOAT returns number:('+' | '-' )?DEC '.' DEC  ;
terminal ANY_OTHER returns string:.;
 
hidden terminal ML_COMMENT returns string:'/*'  -> '*/'  ;
hidden terminal SL_COMMENT returns string:'//'  !('\n' | '\r' )('\r'? '\n' )?  ;
hidden terminal WS:             /\s+/;

