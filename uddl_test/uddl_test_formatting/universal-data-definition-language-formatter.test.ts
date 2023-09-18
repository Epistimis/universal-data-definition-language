import { createUniversalDataDefinitionLanguageServices } from "../../src/language-server/universal-data-definition-language-module";
import { EmptyFileSystem } from "langium";
import { expectFormatting } from "langium/test";

const universalDataDefinitionLanguageService =createUniversalDataDefinitionLanguageServices({...EmptyFileSystem,}).UniversalDataDefinitionLanguage;
const universalDataDefinitionLanguageFormatting = expectFormatting(universalDataDefinitionLanguageService
);

describe("Universal Data Definition Language Formatter", () => {
  it("should format cdm array with conceptual elemnt", async () => {
    await universalDataDefinitionLanguageFormatting({
      before:
        'dm PPT "Base data structures to support People, Places and Things"{cdm Conceptual "Need to start at Conceptual Level"{basis uddlBasis "Formating conceptual basis entity"; domain cdmDomain "Entry for conceptual domain"; cdm anothercdm "A cdm with another data" {observable Information "Something a party can learn";}}}',
      after: `dm PPT "Base data structures to support People, Places and Things"
{

    cdm Conceptual "Need to start at Conceptual Level"
    {
    
        basis uddlBasis "Formating conceptual basis entity";
        domain cdmDomain "Entry for conceptual domain";
        cdm anothercdm "A cdm with another data"
        {
        
            observable Information "Something a party can learn";
        }
        
    }
    
}`
    });
  });

  it("should format conceptual element", async () => {
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