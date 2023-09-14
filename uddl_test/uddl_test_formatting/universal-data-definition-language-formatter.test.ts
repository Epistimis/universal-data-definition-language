import { createUniversalDataDefinitionLanguageServices } from "../../src/language-server/universal-data-definition-language-module";
import { EmptyFileSystem } from "langium";
import { expectFormatting } from "langium/test";

const universalDataDefinitionLanguageService =createUniversalDataDefinitionLanguageServices({...EmptyFileSystem,}).UniversalDataDefinitionLanguage;
const universalDataDefinitionLanguageFormatting = expectFormatting(universalDataDefinitionLanguageService
);

describe("Universal Data Definition Language Formatter", () => {
  it("should format cdm ", async () => {
    await universalDataDefinitionLanguageFormatting({
      before:
        'dm PPT "Base data structures to support People, Places and Things"{cdm Conceptual "Need to start at Conceptual Level"{basis ee;}}',
      after: `dm PPT "Base data structures to support People, Places and Things"
{

    cdm Conceptual "Need to start at Conceptual Level"
    {
    
        basis ee ;
    }
    
}`
    });
  });

  it("should format concptual element", async () => {
    await universalDataDefinitionLanguageFormatting({
      before:
        'dm PPT "Base data structures to support People, Places and Things"{cdm Conceptual "Need to start at Conceptual Level"{cassoc Training "Information delivered over time from one party to another " {};centity AddressableEntity "Any entity that is addressable in some way" {};}}',
      after: `dm PPT "Base data structures to support People, Places and Things"
{

    cdm Conceptual "Need to start at Conceptual Level"
    {
    
        cassoc Training "Information delivered over time from one party to another "
        {
        
        };
        
        centity AddressableEntity "Any entity that is addressable in some way"
        {
        
        };
        
    }
    
}`
    });
  });
});