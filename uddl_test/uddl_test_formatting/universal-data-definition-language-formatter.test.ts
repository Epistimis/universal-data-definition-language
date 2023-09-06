import { createUniversalDataDefinitionLanguageServices } from "../../src/language-server/universal-data-definition-language-module";
import { EmptyFileSystem } from "langium";
import { expectFormatting } from "langium/test";

const universalDataDefinitionLanguageService =createUniversalDataDefinitionLanguageServices({...EmptyFileSystem,}).UniversalDataDefinitionLanguage;
const universalDataDefinitionLanguageFormatting = expectFormatting(universalDataDefinitionLanguageService
);

describe("Universal Data Definition Language Formatter", () => {
  it("should indent correctly", async () => {
    await universalDataDefinitionLanguageFormatting({
      before:
        'dm PPT "Base data structures to support People, Places and Things"{cdm Conceptual "Need to start at Conceptual Level"{}}',
      after: `dm PPT "Base data structures to support People, Places and Things"
{

    cdm Conceptual "Need to start at Conceptual Level"
    {
    
    }
    
}`
    });
  });
});
