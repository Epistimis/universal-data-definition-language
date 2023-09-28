import { AbstractFormatter, AstNode, Formatting, Module, PartialLangiumServices, } from 'langium';
import * as ast from './generated/ast';
import { UniversalDataDefinitionLanguageServices } from './universal-data-definition-language-module';

export class UniversalDataDefinitionLanguageFormatter extends AbstractFormatter {
    protected formatContainer(node: AstNode): void {
        const formatter = this.getNodeFormatter(node);
        const open = formatter.keyword('{');
        const close = formatter.keyword('}');
        formatter.interior(open,close).prepend(Formatting.indent());
        open.prepend(Formatting.newLine()).append(Formatting.newLine());
        close.prepend(Formatting.newLine({allowMore: true})).append(Formatting.newLine({allowMore: true}));
    }

    protected formatObj(node: AstNode): void {
        const formatter = this.getNodeFormatter(node);
        const open = formatter.keyword('{');
        const close = formatter.keyword('};');
        formatter.interior(open,close).prepend(Formatting.indent());
        open.append(Formatting.newLine());
        close.surround(Formatting.noSpace()).prepend(Formatting.newLine({allowMore: true})).append(Formatting.newLine({allowMore: true}));
    }

    protected formatNode(node: AstNode): void {
        const formatter = this.getNodeFormatter(node);
        formatter.property('name').prepend(Formatting.newLine()).surround(Formatting.oneSpace({allowMore: true}))
    }

    protected format(node: AstNode): void {        
        // This method is called for every AstNode in a document
        if (ast.isDataModel(node)) {
            this.formatDataModel(node);
        }
        else if(ast.isConceptualAssociation(node)){            
            this.formatConceptualAssociation(node)
        }
        else if(ast.isConceptualEntity(node)){
            this.formatConceptualEntity(node)
        }             
        else if(ast.isLogicalEnumerated(node)){
            this.formatLogicalEnumerated(node)
        }
        else if(ast.isLogicalMeasurement(node)){
            this.formatLogicalMeasurement(node)
        }  
        else if(ast.isLogicalMeasurementSystemAxis(node)){
            this.formatLogicalMeasurementSystemAxis(node)
        } 
        else if(ast.isLogicalValueTypeUnit(node)){
            this.formatLogicalValueTypeUnit(node)
        }
        else if(ast.isLogicalMeasurement(node)){
            this.formatLogicalMeasurement(node)
        }
        else if(ast.isLogicalEntity(node)){
            this.formatLogicalEntity(node)
        }
        else if(ast.isLogicalAssociation(node)){
            this.formatLogicalAssociation(node)
        }
        else if(ast.isLogicalParticipantPathNode(node)){
            this.formatLogicalParticipantPathNode(node)
        }

    }


    protected formatDataModel(dataModel: ast.DataModel): void {
        this.formatContainer(dataModel);
        
        dataModel.cdm.forEach( dm => {
            this.formatConceptualDataModel(dm);
        })
        
        dataModel.ldm.forEach(dm => {
            this.formatLogicalDataModel(dm)
        })

        dataModel.pdm.forEach(dm => {
            this.formatPlatfornDataModel(dm)
        })

    }

    protected formatConceptualDataModel(cdm: ast.ConceptualDataModel): void {
        this.formatContainer(cdm);
        cdm.cdm.forEach(dm => {            
            this.formatConceptualDataModel(dm);
        })
        cdm.element.forEach( elem => {            
            this.formatConceptualElement(elem);
        })
    }

    protected formatLogicalDataModel(ldm: ast.LogicalDataModel): void {
        this.formatContainer(ldm)
        ldm.ldm.forEach(dm => {
            this.formatLogicalDataModel(dm)
        })
        ldm.element.forEach( elem => {
            this.formatLogicalElement(elem)
        })
    }

    protected formatPlatfornDataModel(pdm: ast.PlatformDataModel): void {
        this.formatContainer(pdm)
        pdm.pdm.forEach(dm => {
            this.formatPlatfornDataModel(dm)
        })
        pdm.element.forEach(elem => {
            this.formatPlatformElement(elem)
        })
    }

    /**Formatting conceptuals */
    protected formatConceptualElement(elem: ast.ConceptualElement): void {                
        const formatter = this.getNodeFormatter(elem);
        formatter.property('name').prepend(Formatting.newLine({allowMore: true})).surround(Formatting.oneSpace({allowMore: true}));
        this.formatObj(elem);
    }

    protected formatConceptualEntity(entity: ast.ConceptualEntity): void {
        this.formatContainer(entity)
        entity.composition.forEach(comp => {
            this.formatConceptualComposition(comp)
        })
    }

    protected formatConceptualAssociation(cassoc: ast.ConceptualAssociation): void {
        this.formatContainer(cassoc)
        cassoc.composition.forEach(comp => {
            this.formatConceptualComposition(comp)
        })
    }

    protected formatConceptualComposition(comp: ast.ConceptualComposition   ): void {
        this.formatContainer(comp)
    }

    protected formatConceptualParticipant(participant: ast.ConceptualParticipant): void {
        this.formatContainer(participant)    
        if(participant?.type){
            this.formatConceptualEntity(participant.type.ref!)
        }
    }

    /**Formatting logicals */
    protected formatLogicalElement(elem: ast.LogicalElement): void {
        const formatter = this.getNodeFormatter(elem);
        formatter.property('name').prepend(Formatting.newLine()).surround(Formatting.oneSpace({allowMore: true}));
        this.formatObj(elem);   
    }

    protected formatLogicalEnumerated(lenum: ast.LogicalEnumerated): void {
        this.formatContainer(lenum)
        lenum.label.forEach(label => {
            this.formatContainer(label)
        })
    }

    protected formatLogicalMeasurementSystem(sys: ast.LogicalMeasurementSystem): void {
        this.formatContainer(sys);
        sys.constraint.forEach(sysConst => {
            this.formatContainer(sysConst)
        })
        sys.referencePoint.forEach(ref => {
            this.formatLogicalReferencePoint(ref);
        })
    }

    protected formatLogicalMeasurementSystemAxis(sysAxis: ast.LogicalMeasurementSystemAxis): void {
        this.formatContainer(sysAxis);
        sysAxis.constraint.forEach(sysConst => {
            this.formatContainer(sysConst);
        })
    }

    protected formatLogicalReferencePoint(refPoint: ast.LogicalReferencePoint): void {
        this.formatContainer(refPoint);
        refPoint.referencePointPart.forEach(pointPart => {
            this.formatContainer(pointPart);
        })
    }

    protected formatLogicalValueTypeUnit(typeUnit: ast.LogicalValueTypeUnit):void {
        this.formatContainer(typeUnit);
        if(typeUnit.constraint){
            this.formatContainer(typeUnit);
        }
    }

    protected formatLogicalMeasurement(measure: ast.LogicalMeasurement): void {
        this.formatContainer(measure);
        measure.attribute.forEach(attr => {
            this.formatContainer(attr)
        })
        measure.constraint.forEach(mesConst => {
            this.formatContainer(mesConst)
        })
    }

    protected formatLogicalEntity(entity: ast.LogicalEntity): void {
        this.formatContainer(entity);
        entity.composition.forEach(comp => {
            this.formatContainer(comp);
        })
    }

    protected formatLogicalAssociation(asso: ast.LogicalAssociation): void {
        this.formatContainer(asso);
        asso.composition.forEach(comp => {
            this.formatContainer(comp);
        })
        asso.participant.forEach(part => {
            this.formatLogicalParticipant(part);
        })
    }

    protected formatLogicalParticipant(part: ast.LogicalParticipant): void {
        this.formatContainer(part)
    }

    protected formatLogicalParticipantPathNode(pathBode: ast.LogicalParticipantPathNode): void {
        this.formatContainer(pathBode)
    }

    protected formatPlatformElement(elem: ast.PlatformElement): void {
        const formatter = this.getNodeFormatter(elem);
        formatter.property('name').prepend(Formatting.newLine()).surround(Formatting.oneSpace({allowMore: true}));
        this.formatObj(elem);   
    }
}


// Bind the class in your module
export const UniversalDataDefinitionLanguageModule: Module<UniversalDataDefinitionLanguageServices, PartialLangiumServices> = {
    lsp: {
        Formatter: () => new UniversalDataDefinitionLanguageFormatter()
    }
};