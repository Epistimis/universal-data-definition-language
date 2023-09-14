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

    protected format(node: AstNode): void {        
        // This method is called for every AstNode in a document
        if (ast.isDataModel(node)) {
            this.formatDataModel(node);
        }
        if(ast.isConceptualAssociation(node)){            
            this.formatConceptualAssociation(node)
        }

        if(ast.isConceptualEntity(node)){
            this.formatConceptualEntity(node)
        }

        if(ast.isConceptualBasisEntity(node)){
            this.formatConceptualBasisEntity(node)
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

    protected formatConceptualBasisEntity(basis: ast.ConceptualBasisEntity): void {
        const formatter = this.getNodeFormatter(basis);
        formatter.property('name').prepend(Formatting.newLine()).surround(Formatting.oneSpace({allowMore: true}));
    }

    protected formatConceptualAssociation(cassoc: ast.ConceptualAssociation): void {
        this.formatContainer(cassoc)

        cassoc.composition.forEach(comp => {
            this.formatConceptualComposition(comp)
        })
    }

    protected formatConceptualCharacteristic(xter: ast.ConceptualCharacteristic): void {}

    protected formatConceptualComposition(comp: ast.ConceptualComposition   ): void {
        this.formatContainer(comp)
    }

    protected formatConceptualParticipant(participant: ast.ConceptualParticipant): void {
        this.formatContainer(participant)
        
        if(participant?.type){
            this.formatConceptualEntity(participant.type.ref!)
        }
    }

    protected formatLogicalElement(elem: ast.LogicalElement): void {
        const formatter = this.getNodeFormatter(elem);
        formatter.property('name').prepend(Formatting.newLine()).surround(Formatting.oneSpace({allowMore: true}));
        this.formatObj(elem);   
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