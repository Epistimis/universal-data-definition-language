import { AstNode } from "langium";
import { UniversalDataDefinitionLanguageFormatter } from "../../src/language-server/universal-data-definition-language-formatter";
// import * as ast from "../../src/language-server/generated/ast";

/** Hav access to the protected class defined in the UniversalDataDefinitionLanguageFormatter class */
class UniversalDataDefinitionLanguageFormatterTest extends UniversalDataDefinitionLanguageFormatter {
  formatContainerTest(node: AstNode):void {
     this.formatContainer(node);
  }
}

describe("UniversalDataDefinitionLanguageFormatter", () => {
  it("formats a container node", () => {
    const container: AstNode = { $type: "" };
    const formatter = new UniversalDataDefinitionLanguageFormatterTest();
    const mockFormatContainer = jest.spyOn(formatter, "formatContainerTest");
    formatter.formatContainerTest(container);
    expect(mockFormatContainer).toHaveBeenCalledWith(container);
  });
});
