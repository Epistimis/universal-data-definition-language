import { createUniversalDataDefinitionLanguageServices } from "../../src/language-server/universal-data-definition-language-module";
import { EmptyFileSystem } from "langium";
import { expectFormatting } from "langium/test";

const universalDataDefinitionLanguageService = createUniversalDataDefinitionLanguageServices({...EmptyFileSystem,}).UniversalDataDefinitionLanguage;
const universalDataDefinitionLanguageFormatting = expectFormatting(universalDataDefinitionLanguageService);

describe("Universal Data Definition Language Formatter", () => {
  it("should format cdm array", async () => {
    await universalDataDefinitionLanguageFormatting({
      before:
        'dm PPT "Base data structures to support People, Places and Things"{cdm Conceptual "Need to start at Conceptual Level"{cdm anothercdm "A cdm with another data" {observable Information "Something a party can learn";}}}',
      after: `dm PPT "Base data structures to support People, Places and Things"
{

    cdm Conceptual "Need to start at Conceptual Level"
    {
    
        cdm anothercdm "A cdm with another data"
        {
        
            observable Information "Something a party can learn";
        }
        
    }
    
}`,
    });
  });

  it("should format cdm with conceptual association", async () => {
    await universalDataDefinitionLanguageFormatting({
      before:
        'dm PPT "Base data structures to support People, Places and Things"{cdm Conceptual "Need to start at Conceptual Level"{cassoc Training "Information delivered over time from one party to another " {};}}',
      after: `dm PPT "Base data structures to support People, Places and Things"
{

    cdm Conceptual "Need to start at Conceptual Level"
    {
    
        cassoc Training "Information delivered over time from one party to another "
        {
        
        };
        
    }
    
}`,
    });
  });

  it("should format cdm with conceptual entity", async () => {
    await universalDataDefinitionLanguageFormatting({
      before:
        'dm PPT "Base data structures to support People, Places and Things"{cdm Conceptual "Need to start at Conceptual Level"{centity AddressableEntity "Any entity that is addressable in some way" {};}}',
      after: `dm PPT "Base data structures to support People, Places and Things"
{

    cdm Conceptual "Need to start at Conceptual Level"
    {
    
        centity AddressableEntity "Any entity that is addressable in some way"
        {
        
        };
        
    }
    
}`,
    });
  });

  it('should format cdm with conceptual basis',async () => {
    await universalDataDefinitionLanguageFormatting({
      before: 
      'dm PPT "Base data structures to support People, Places and Things"{cdm Conceptual "Need to start at Conceptual Level"{basis uddlBasis "Formating conceptual basis entity"; }}',
      after: `dm PPT "Base data structures to support People, Places and Things"
{

    cdm Conceptual "Need to start at Conceptual Level"
    {
    
        basis uddlBasis "Formating conceptual basis entity";
    }
    
}`,
    })    
  })

  it('should format cdm with conceptual domain',async () => {
    await universalDataDefinitionLanguageFormatting({
      before: 
      'dm PPT "Base data structures to support People, Places and Things"{cdm Conceptual "Need to start at Conceptual Level"{domain NaturalPerson "Base definition of a natural person"; }}',
      after: `dm PPT "Base data structures to support People, Places and Things"
{

    cdm Conceptual "Need to start at Conceptual Level"
    {
    
        domain NaturalPerson "Base definition of a natural person";
    }
    
}`,
    })    
  })

  it("should format ldm array",async () => {
    await universalDataDefinitionLanguageFormatting({
      before: 'dm Book "Base definition for book requirement" {ldm library "contains available books" {ldm BookShelf "Books related by category"{}}}',
      after: `dm Book "Base definition for book requirement"
{

    ldm library "contains available books"
    {
    
        ldm BookShelf "Books related by category"
        {
        
        }
        
    }
    
}`
    })    
  })
});
