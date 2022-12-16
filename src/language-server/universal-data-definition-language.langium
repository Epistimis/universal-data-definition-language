grammar UniversalDataDefinitionLanguage

// Starter rule comes first

entry File:
    (import+=Import)*
    model+=DataModel+
    ;

DataModel:
	'dm' name=ID (description=STRING)? '{'
		(cdm+=ConceptualDataModel)?
		(ldm+=LogicalDataModel)?
		(pdm+=PlatformDataModel)?
	'}'
	;

// A few generic rules


QN returns string:
    ID ('.' ID)*;
 
Import:
    'import' importedNamespace=QualifiedNameWithWildcard;
 
QualifiedNameWithWildcard returns string:
    QN '.*'?;
 
 // Metamodel concepts starts here   

UddlElement:
	DataModel |
	ConceptualDataModel | LogicalDataModel | PlatformDataModel|
	ConceptualElement|
	LogicalElement |
	PlatformElement
;

ConceptualDataModel:
	'cdm'	name=ID (description=STRING)? '{'
		(element+=ConceptualElement | cdm+=ConceptualDataModel)*
	'}'
;

LogicalDataModel:
	'ldm'	name=ID (description=STRING)? '{'
		(element+=LogicalElement | ldm+=LogicalDataModel)*	
	'}'
;


PlatformDataModel:
	'pdm'	name=ID (description=STRING)? '{'
		(element+=PlatformElement | ldm+=PlatformDataModel)*	
	'}'
;


ConceptualElement:
	ConceptualDomain |
	ConceptualBasisEntity |
	ConceptualComposableElement |
	ConceptualView	
;

ConceptualComposableElement:
	ConceptualEntity |
	ConceptualObservable
;
//NOTE: BasisElement has single inheritance - it has no independent functionality so it gets dropped


ConceptualBasisEntity:
	'basis' name=ID (description=STRING)? ';'
;

ConceptualDomain:
	'domain' name=ID (description=STRING)? ';'
;

ConceptualObservable:
	'observable' name=ID (description=STRING)? ';'
;


ConceptualCharacteristic:
	ConceptualComposition |
	ConceptualParticipant
;

ConceptualEntity:
	ConceptualAssociation |
	'ce' name=ID (description=STRING)? ':' (specializes=[ConceptualEntity:QN])? '{'
		(composition+=ConceptualComposition)?
		('basis:' (basisEntity+=[ConceptualBasisEntity:QN]))?
	'}' ';'
;

ConceptualComposition:
	type=[ConceptualComposableElement:QN]  rolename=ID '[' (lowerBound=INT)? ':' (upperBound=INT)? ']' (description=STRING)? ':' (specializes=[ConceptualCharacteristic:QN])? ';'
;

ConceptualAssociation:
		'ca' name=ID (description=STRING)? ':' (specializes=[ConceptualEntity:QN])? '{'
		(composition+=ConceptualComposition)?
		('basis:' (ConceptualBasisEntity+=[ConceptualBasisEntity:QN]))?
		('participants:' participant+=ConceptualParticipant)?
	'}' ';'
;

ConceptualParticipant:
	type=[ConceptualEntity:QN]  rolename=ID '[' (lowerBound=INT)? ':' (upperBound=INT)? ']' (description=STRING)? ':' (specializes=[ConceptualCharacteristic:QN])? 
		'{'
			'src:' '['sourceLowerBound=INT ':' sourceUpperBound=INT ']'
			'path:' path=ConceptualPathNode 
		'}'
		';'
;

ConceptualPathNode:
	ConceptualParticipantPathNode |
	ConceptualCharacteristicPathNode
;

// NOTE: There is something I did to set up the path resolution here that made things very succinct. I think it had to do
// with the NameProvider?
ConceptualParticipantPathNode:
	'{p:' projectedParticipant=[ConceptualParticipant:QN] '}'
	('->' node=ConceptualPathNode )?
;

ConceptualCharacteristicPathNode:
	'{c:' projectedCharacteristic=[ConceptualCharacteristic:QN] '}'
	('->' node=ConceptualPathNode )?
;

ConceptualView:
	ConceptualQuery |
	ConceptualCompositeQuery
;

ConceptualQuery:
	'cq' name=ID (description=STRING)? '{'
		'spec:' specification=STRING
	'}' ';'
;

ConceptualCompositeQuery:
	'ccq' name=ID (description=STRING)? '{'
		isUnion?='isUnion'
		composition+=ConceptualQueryComposition
		(composition+=ConceptualQueryComposition)+
	'}' ';'
;

ConceptualQueryComposition:
	type=[ConceptualView:QN] rolename=ID ';'
;



LogicalElement:
	LogicalComposableElement |
	LogicalConversion | // LogicalConversion has a single inheritance of LogicalAffineConversion - so that is promoted to here
	LogicalUnit | //LogicalConvertibleElement | // LogicalConvertibleElement has a single inheritance of LogicalUnit - promote that to here
	LogicalCoordinateSystem |
	LogicalCoordinateSystemAxis |
	LogicalMeasurementConversion |
	LogicalMeasurementSystemConversion |
	LogicalMeasurementAxis | // Also derived from AbstractMeasurement
	LogicalAbstractMeasurementSystem| //LogicalMeasurementSystem |
	LogicalMeasurementSystemAxis |
	LogicalValueType | // Also derived from AbstractMeasurement
	LogicalView 
;

// NOTE: LogicalConvertibleElement has LogicalUnit as a single inheritance. Since it has nothing else, promote LogicalUnit directly
// to LogicalElement
LogicalUnit:
	'lunit' name=ID (description=STRING)? ';'
;

// NOTE: LogicalConversion has LogicalAffineConversion as a single inheritance. Since it has nothing else, promote LogicalAffineConversion directly
// to LogicalElement
LogicalConversion:
	'conv' name=ID  (description=STRING)? '{'
		source=[LogicalAssociation:QN] '->'  destination=[LogicalAssociation:QN] 
		'}' ';' |
	LogicalAffineConversion
;

LogicalAffineConversion:
	'aconv' name=ID  (description=STRING)? '{'
		source=[LogicalAssociation:QN] '-(' conversionFactor=FLOAT ',' offset=FLOAT ')->'  destination=[LogicalAssociation:QN]
	'}' ';' 
;

LogicalValueType:
	LogicalBoolean |
	LogicalNumeric |
	LogicalCharacter |
	LogicalString |
	LogicalEnumerated	
;

LogicalString: 					'str' 	name=ID (description=STRING)? ';' 	;
LogicalCharacter: 				'char' 	name=ID (description=STRING)? ';'	;
LogicalBoolean:					'bool' 	name=ID (description=STRING)? ';'	;


LogicalNumeric:
	LogicalInteger |
	LogicalNatural |
	LogicalReal |
	LogicalNonNegativeReal
;

LogicalInteger:					'int' 	name=ID (description=STRING)? ';'	;
LogicalNatural:					'nat' 	name=ID (description=STRING)? ';'	;
LogicalReal:					'real' 	name=ID (description=STRING)? ';'	;
LogicalNonNegativeReal:			'real+' name=ID (description=STRING)? ';'	;
LogicalEnumerated:				

	'enum' 	name=ID (description=STRING)? '['
		label+=LogicalEnumerationLabel (',' label+=LogicalEnumerationLabel)*
		']'
		';'	
		;

LogicalEnumerationLabel:		'(' name=ID (description=STRING)? ')' ;

LogicalCoordinateSystem:
	'coord' name=ID (description=STRING)? '{'
		('axis:' 		axisRelationshipDescription=STRING)?
		('angleEq:' 	angleEquation=STRING)?
		('distanceEq:' 	distanceEquation=STRING)?
		'['axis+=[LogicalCoordinateSystemAxis:QN]+ ']'
	'}' ';'
;

LogicalCoordinateSystemAxis:
	'csa' name=ID (description=STRING)? ';'
;



LogicalAbstractMeasurementSystem:
	LogicalStandardMeasurementSystem |
	LogicalMeasurementSystem
;

LogicalStandardMeasurementSystem: 
	'smsys' name=ID (description=STRING)? '{'
		'refStd:' referenceStandard=STRING
	'}' ';'
;

LogicalLandmark:
	'landmark' name=ID (description=STRING)? ';'
;

LogicalMeasurementSystem: 
	'msys' name=ID (description=STRING)? '{'
		('extRefStd:' externalStandardReference=STRING)?
		('orient:' orientation=STRING)?
		'maxis:' '[' measurementSystemAxis+=[LogicalMeasurementSystemAxis:QN] ']'
		'coord:' coordinateSystem=[LogicalCoordinateSystem:QN]
		('refPt:' '[' referencePoint+=LogicalReferencePoint ']')?
		('![' constraint+=LogicalMeasurementConstraint ']')?
	'}' ';'
;

LogicalMeasurementSystemAxis:
	'msa' name=ID (description=STRING)? '{'
		'axis:' axis=[LogicalCoordinateSystemAxis:QN]
		'vtu:' '[' defaultValueTypeUnit+=[LogicalValueTypeUnit:QN] ']'
		('![' constraint+=LogicalMeasurementConstraint ']'	)?	
	'}' ';'
;

LogicalReferencePoint:
	'refPt'	name=ID (description=STRING)? '{'
		'landmark:' landmark=[LogicalLandmark:QN]
		'[' referencePointPart+=LogicalReferencePointPart ']'
	'}' ';'
;

LogicalReferencePointPart:
	'(' (valueTypeUnit=[LogicalValueTypeUnit:QN])? value=STRING (axis=[LogicalMeasurementSystemAxis:QN])? ')'
;


LogicalValueTypeUnit:
	'vtu' unit=[LogicalUnit:QN] valueType=[LogicalValueType:QN] name=ID (description=STRING)? '{'
	'!' constraint=LogicalConstraint
	'}' ';'
;

LogicalConstraint:
	LogicalStringConstraint |
	LogicalRealRangeConstraint | //LogicalRealConstraint | //LogicalRealConstraint has a single inheritance of LogicalRealRangeConstraint - promote that to here
	LogicalIntegerRangeConstraint | //LogicalIntegerConstraint | //LogicalIntegerConstraint has single inheritance of LogicalIntegerRangeConstraint
	LogicalEnumerationConstraint
;

//LogicalIntegerConstraint:
//	LogicalIntegerRangeConstraint
//;

LogicalIntegerRangeConstraint:
	'irc'  name=ID '[' lowerBound=INT ':' upperBound=INT ']' (description=STRING)?  ';'
;

//LogicalRealConstraint:
//	LogicalRealRangeConstraint
//;

// TODO: There is a way to default this to handle the include exclude bounds - is this it?
LogicalRealRangeConstraint:
	'rrc' name=ID ( '(' | lowerBoundInclusive?='[') lowerBound=FLOAT ':' upperBound=FLOAT (')'| upperBoundInclusive?=']') (description=STRING)?  ';'
;

LogicalStringConstraint: 
	LogicalRegularExpressionConstraint |
	LogicalFixedLengthStringConstraint
;

LogicalRegularExpressionConstraint:
	'rec' name=ID '[' expression=STRING ']'(description=STRING)? ';'
;

LogicalFixedLengthStringConstraint:
	'flsc' name=ID '[' length=INT ']' (description=STRING)? ';'	
;

// NOTE: While the spec technically allows zero labels, it makes no sense to have a constraint that doesn't 
// actually constrain anything. It might be in dynamic cases that this list could end up being empty - but 
// for now we assume it has to have at least 1 value
LogicalEnumerationConstraint :
	 'ec' '[' (allowedValue+=[LogicalEnumerationLabel:QN])? ']'
;

LogicalMeasurementConstraint:
	'mc'  name=ID '[' constraintText=STRING ']' (description=STRING)? ';'
;


LogicalMeasurementSystemConversion:
	'msc' name=ID  (description=STRING)? '{'
		source=[LogicalMeasurementSystem:QN] '->' destination=[LogicalMeasurementSystem:QN]
		'eqn:' '[' equation+=STRING (',' equation+=STRING)? ']'
		'loss:' conversionLossDescription=STRING
	'}' ';'
;


// TODO: XText doesn't do multiple inheritance. Address this via a ScopeProvider
// See https://www.eclipse.org/Xtext/documentation/303_runtime_concepts.html#scoping
// Use a FilteringScope
//LogicalAbstractMeasurement:
//	LogicalMeasurement |  // Use LogicalComposableElement
//	LogicalMeasurementAxis | // Use LogicalElement
//	LogicalValueTypeUnit  //Use LogicalElement
//;


LogicalMeasurement:
	'meas' name=ID  (description=STRING)? '->' realizes=[ConceptualObservable:QN] '{'
		attribute+=LogicalMeasurementAttribute
		('axis:' '[' measurementAxis+=[LogicalMeasurementAxis:QN] ']')?
		'sys:' measurementSystem=[LogicalAbstractMeasurementSystem:QN]
		('![' constraint+=LogicalMeasurementConstraint ']')?	
;

LogicalMeasurementAxis:
	'maxis' name=ID  (description=STRING)? ('->' realizes=[ConceptualObservable:QN])? '{'
		('vtu:' '[' valueTypeUnit+=[LogicalValueTypeUnit:QN] ']')?
		'msaxis:' measurementSystemAxis=[LogicalMeasurementSystemAxis:QN]
	'}' ';'
;

LogicalMeasurementAttribute:
	type=[LogicalMeasurement:QN] rolename=ID
;

LogicalMeasurementConversion:
	'mc' name=ID  (description=STRING)? '{'
		source=[LogicalMeasurementSystem:QN] '->' destination=[LogicalMeasurementSystem:QN]
		'eqn:' '[' equation+=STRING (',' equation+=STRING)? ']'
		'loss:' conversionLossDescription=STRING
	'}' ';'
;

LogicalComposableElement:
	LogicalEntity |
	LogicalMeasurement  // Also derived from AbstractMeasurement
;


LogicalCharacteristic:
	LogicalComposition |
	LogicalParticipant
;

LogicalEntity:
	'lentity' name=ID  (description=STRING)? (':' specializes=[LogicalEntity:QN])? '->' realizes=[ConceptualEntity:QN] '{'
		(composition+=LogicalComposition)?
	'}' ';'
	| LogicalAssociation
;

LogicalComposition:
	type=[LogicalComposableElement:QN]  rolename=ID '[' lowerBound=INT ':' upperBound=INT ']' (description=STRING)? (':' specializes=[LogicalCharacteristic:QN])?  '->' realizes=[ConceptualComposition:QN]
	
;

LogicalAssociation:
	'lassoc' name=ID  (description=STRING)? (':' specializes=[LogicalEntity:QN])? '->' realizes=[ConceptualEntity:QN] '{'
		(composition+=LogicalComposition)?
		// While technically this is optional, it makes no sense to have an Association with less than 2 participants. However,
		// Those participants can be named anywhere in the inheritance/ specializes hierarchy - not just locally
		('participants:' '[' participant+=LogicalParticipant ']')?
	'}' ';'	
;

LogicalParticipant:
	type=[LogicalAssociation:QN]  rolename=ID '[' lowerBound=INT ':' upperBound=INT ']' (description=STRING)? (':' specializes=[LogicalCharacteristic:QN])?  '->' realizes=[ConceptualParticipant:QN] '{'
		'source:' '[' sourceLowerBound=INT ':' sourceUpperBound=INT ']'
		('path:' path=LogicalPathNode )?
	'}' ';'
;

LogicalPathNode:
	LogicalParticipantPathNode |
	LogicalCharacteristicPathNode
;

LogicalParticipantPathNode:
	'/' projectedParticipant=[LogicalParticipant:QN]  ( node=LogicalPathNode)
;

LogicalCharacteristicPathNode:
	':' projectedCharacteristic=[LogicalCharacteristic:QN]  ( node=LogicalPathNode)
	
;

LogicalView:
	LogicalQuery |
	LogicalCompositeQuery
;

LogicalQuery:
	'lquery' name=ID  (description=STRING)? ('->' realizes=[ConceptualQuery:QN])? '{'
		'spec:' specification=STRING
		'}' ';'
;

LogicalCompositeQuery:
	'lcquery' name=ID  (description=STRING)? ('->' realizes=[ConceptualCompositeQuery:QN])? '{'
		isUnion?='isUnion'
		composition+=LogicalQueryComposition
		'}' ';'
;

LogicalQueryComposition:
	type=[LogicalView:QN] rolename=ID ( '->' realizes=[ConceptualQueryComposition:QN])?
;

/* * * * * * * Platform Level Rules * * * * * *  */

PlatformElement:
	PlatformComposableElement |
	PlatformView
;

PlatformComposableElement:
	PlatformEntity |
	PlatformDataType
;
PlatformDataType:
	PlatformPrimitive |
	PlatformStruct
;

	
PlatformPrimitive:
	PlatformSequence |
	PlatformBoolean |
	PlatformCharType |
	PlatformNumber |
	PlatformOctet |
	PlatformEnumeration |
	PlatformStringType
;

PlatformBoolean:			'bool'  						name=ID  (description=STRING)? '->' realizes=[/*LogicalAbstractMeasurement*/LogicalElement:QN] ';' ;
PlatformOctet:				'octet'  						name=ID  (description=STRING)? '->' realizes=[/*LogicalAbstractMeasurement*/LogicalElement:QN] ';' ;

PlatformCharType:
	PlatformChar |
	PlatformWChar // NOTE: WChar was removed from the spec. Not clear is we want it
;

PlatformChar:				'char'  						name=ID  (description=STRING)? '->' realizes=[/*LogicalAbstractMeasurement*/LogicalElement:QN] ';' ;
PlatformWChar:				'wchar'  						name=ID  (description=STRING)? '->' realizes=[/*LogicalAbstractMeasurement*/LogicalElement:QN] ';' ;

PlatformStringType:
	PlatformString |
	PlatformBoundedString |
	PlatformCharArray
;

PlatformString:				'string'  						name=ID  (description=STRING)? '->' realizes=[/*LogicalAbstractMeasurement*/LogicalElement:QN] ';' ;
PlatformBoundedString:		'string[' maxLength=INT ']'  	name=ID  (description=STRING)? '->' realizes=[/*LogicalAbstractMeasurement*/LogicalElement:QN] ';' ;
PlatformCharArray:			'char['   length=INT ']'  		name=ID  (description=STRING)? '->' realizes=[/*LogicalAbstractMeasurement*/LogicalElement:QN] ';' ;

PlatformEnumeration:		'enum'  						name=ID  (description=STRING)? '->' realizes=[/*LogicalAbstractMeasurement*/LogicalElement:QN] ';' ;
	
PlatformNumber:
	PlatformReal |
	PlatformInteger
;

PlatformInteger:
	PlatformLong |
	PlatformShort |
	PlatformUnsignedInteger |
	PlatformLongLong
;

PlatformShort:				'short'  						name=ID  (description=STRING)? '->' realizes=[/*LogicalAbstractMeasurement*/LogicalElement:QN] ';' ;
PlatformLong:				'long'  						name=ID  (description=STRING)? '->' realizes=[/*LogicalAbstractMeasurement*/LogicalElement:QN] ';' ;
PlatformLongLong:			'llong'  						name=ID  (description=STRING)? '->' realizes=[/*LogicalAbstractMeasurement*/LogicalElement:QN] ';' ;


PlatformReal:
	PlatformFixed |
	PlatformFloat |
	PlatformDouble |
	PlatformLongDouble
;

PlatformDouble:				'double'  						name=ID  (description=STRING)? '->' realizes=[/*LogicalAbstractMeasurement*/LogicalElement:QN] ';' ;
PlatformLongDouble:			'ldouble'  						name=ID  (description=STRING)? '->' realizes=[/*LogicalAbstractMeasurement*/LogicalElement:QN] ';' ;
PlatformFloat:				'float'  						name=ID  (description=STRING)? '->' realizes=[/*LogicalAbstractMeasurement*/LogicalElement:QN] ';' ;
PlatformFixed:				'fixed[' digits=INT '.' scale=INT ']'
															name=ID  (description=STRING)? '->' realizes=[/*LogicalAbstractMeasurement*/LogicalElement:QN] ';'
;

PlatformUnsignedInteger:
	PlatformUShort |
	PlatformULong |
	PlatformULongLong
;

PlatformUShort:				'ushort'  						name=ID  (description=STRING)? '->' realizes=[/*LogicalAbstractMeasurement*/LogicalElement:QN] ';' ;
PlatformULong:				'ulong'  						name=ID  (description=STRING)? '->' realizes=[/*LogicalAbstractMeasurement*/LogicalElement:QN] ';' ;
PlatformULongLong:			'ullong'  						name=ID  (description=STRING)? '->' realizes=[/*LogicalAbstractMeasurement*/LogicalElement:QN] ';' ;


PlatformSequence:			'seq' ('[' maxSize=INT ']')?  	name=ID  (description=STRING)? '->' realizes=[/*LogicalAbstractMeasurement*/LogicalElement:QN] ';' ;
PlatformArray:				'arr' ('[' size=INT ']')?  		name=ID  (description=STRING)? '->' realizes=[/*LogicalAbstractMeasurement*/LogicalElement:QN] ';' ;

PlatformStruct:
	'struct' name=ID  (description=STRING)? '->' realizes=[/*LogicalAbstractMeasurement*/LogicalElement:QN] '{'
		member+=PlatformStructMember
		member+=PlatformStructMember
		(member+=PlatformStructMember)?
	'}'
;

PlatformStructMember:
	type=[PlatformDataType:QN] rolename=ID '(' precision=FLOAT ')' ('->' realizes=[LogicalMeasurementAttribute:QN] ';')?
;


PlatformCharacteristic:
	PlatformComposition |
	PlatformParticipant
;	

PlatformEntity:
	'pentity' name=ID  (description=STRING)? (':' specializes=[PlatformEntity:QN])? '->' realizes=[LogicalEntity:QN] '{'
		(composition+=PlatformComposition)?
	'}' ';'
	| PlatformAssociation
;

PlatformComposition:
	type=[PlatformComposableElement:QN]  rolename=ID '[' lowerBound=INT ':' upperBound=INT ']' (description=STRING)? (':' specializes=[PlatformCharacteristic:QN])?  '->' realizes=[LogicalComposition:QN]
		'{'
			'prec:' precision=FLOAT
		'}'';'	
;

PlatformAssociation:
	'lassoc' name=ID  (description=STRING)? (':' specializes=[PlatformEntity:QN])? '->' realizes=[LogicalEntity:QN] '{'
		(composition+=PlatformComposition)?
		// While technically this is optional, it makes no sense to have an Association with less than 2 participants. However,
		// Those participants can be named anywhere in the inheritance/ specializes hierarchy - not just locally
		('participants:' '[' participant+=PlatformParticipant ']')?
	'}' ';'	
;

PlatformParticipant:
	type=[PlatformAssociation:QN]  rolename=ID '[' lowerBound=INT ':' upperBound=INT ']' (description=STRING)? (':' specializes=[PlatformCharacteristic:QN])?  '->' realizes=[LogicalParticipant:QN] '{'
		'source:' '[' sourceLowerBound=INT ':' sourceUpperBound=INT ']'
		('path:' path=PlatformPathNode )?
	'}' ';'
;

PlatformPathNode:
	PlatformParticipantPathNode |
	PlatformCharacteristicPathNode
;

PlatformParticipantPathNode:
	'/' projectedParticipant=[PlatformParticipant:QN]  ( node=PlatformPathNode)
;

PlatformCharacteristicPathNode:
	':' projectedCharacteristic=[PlatformCharacteristic:QN]  ( node=PlatformPathNode)
	
;

PlatformView:
	PlatformQuery |
	PlatformCompositeQuery
;

PlatformQuery:
	'lquery' name=ID  (description=STRING)? ('->' realizes=[LogicalQuery:QN])? '{'
		'spec:' specification=STRING
		'}' ';'
;

PlatformCompositeQuery:
	'lcquery' name=ID  (description=STRING)? ('->' realizes=[LogicalQuery:QN])? '{'
		isUnion?='isUnion'
		composition+=PlatformQueryComposition
		'}' ';'
;

PlatformQueryComposition:
	type=[PlatformView:QN] rolename=ID ( '->' realizes=[LogicalQueryComposition:QN])?
;




terminal ID: /[_a-zA-Z][\w_]*/;

//terminal LONG returns number INT ("L"|"l");
terminal FLOAT returns number : /[0-9]+/ '.' /[0-9]+/;
//terminal DOUBLE returns number : INT '.' INT ('D'|'d');

terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;

