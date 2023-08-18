import { AstNode } from "langium";
import { UniversalDataDefinitionLanguageFormatter } from "../../src/language-server/universal-data-definition-language-formatter";
import * as ast from "../../src/language-server/generated/ast";

class UniversalDataDefinitionLanguageFormatterTest extends UniversalDataDefinitionLanguageFormatter {
  formatContainer(node: AstNode) {
    return this.formatContainer(node);
  }
}

describe("UniversalDataDefinitionLanguageFormatter", () => {
  it("formats a container node", () => {
    const container: AstNode = { $type: "" };
    const formatter = new UniversalDataDefinitionLanguageFormatterTest();
    const mockFormatContainer = jest.spyOn(formatter, "formatContainer");
    formatter.formatContainer(container);
    expect(mockFormatContainer).toHaveBeenCalledWith(container);
  });
});
