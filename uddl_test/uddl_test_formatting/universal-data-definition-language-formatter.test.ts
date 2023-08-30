import { AstNode } from "langium";
import { UniversalDataDefinitionLanguageFormatter } from "../../src/language-server/universal-data-definition-language-formatter";
import * as ast from "../../src/language-server/generated/ast";

/** Have access to the protected class defined in the UniversalDataDefinitionLanguageFormatter class */
class UniversalDataDefinitionLanguageFormatterTest extends UniversalDataDefinitionLanguageFormatter {
  formatContainerTest(node: AstNode): void {
    this.formatContainer(node);
  }
  formatTest(node: AstNode): void {
    this.format(node);
  }
}

describe("UniversalDataDefinitionLanguageFormatter", () => {
  it("formats a container node", () => {
    const container: AstNode = { $type: "Root container" };
    const formatter = new UniversalDataDefinitionLanguageFormatterTest();
    const mockFormatContainer = jest.spyOn(formatter, "formatContainerTest");
    formatter.formatContainerTest(container);
    expect(mockFormatContainer).toHaveBeenCalledWith(container);
  });

  it("formats conceptual data model", () => {
    // This expects a container deinition of ConceptualDataModel | DataModel | File | LogicalDataModel | LogicalEnumerated | LogicalEnumeratedSet | LogicalMeasurementSystem | LogicalValueTypeUnit | PlatformDataMode type
      const cdmElementContainer: ast.ConceptualElement = { $type: 'ConceptualObservable', name: "Information", description: "Something a party can learn", $container: /*some types*/ }
      const cdmContainer: ast.ConceptualDataModel = { $type: "ConceptualDataModel", name: "Conceptual", description: "Need to start at Conceptual Level", element: [cdmElementContainer], $container: /*come types*/, cdm: [] }
      const  container:ast.DataModel  = { $type: "DataModel", cdm: [cdmContainer], name: "PPT", description: "Base data structures to support People, Places and Things", pdm: [], ldm: [], $container: cdmContainer,};

    const formatter = new UniversalDataDefinitionLanguageFormatterTest();
    const mockFormatContainer = jest.spyOn(formatter, "formatTest");
    formatter.formatTest(container);

  });
});

