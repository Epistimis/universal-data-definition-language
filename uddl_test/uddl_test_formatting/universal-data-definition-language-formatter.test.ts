import { createUniversalDataDefinitionLanguageServices } from "../../src/language-server/universal-data-definition-language-module";
import { EmptyFileSystem } from 'langium';
import { expectFormatting } from 'langium/test';


const services = createUniversalDataDefinitionLanguageServices({...EmptyFileSystem}).UniversalDataDefinitionLanguage
const universalDataDefinitionLanguageFormatting =  expectFormatting(services)

describe("Universal Data Definition Language Formatter", () => {
  it('should create new line formatting', async () => {
    await universalDataDefinitionLanguageFormatting({
      before: 'privacy PPT "Description"{dm PPT "Base data structures to support People, Places and Things" {cdm Conceptual "Need to start at Conceptual Level" {cassoc Training "Information delivered over time from one party to another " {Information info [1:-1] "What was delivered"; AddressableEntity from [0:1]; AddressableEntity to[1:-1]; rivacy.Privacy.General.TimeWindow  when [1:-1] "When the delivery occurred. Could be over multiple periods. ";};};};};', 
      after: `privacy PPT "Description" {
        dm PPT "Base data structures to support People, Places and Things" {
        
          cdm Conceptual "Need to start at Conceptual Level" {
            cassoc Training "Information delivered over time from one party to another " {
              Information info [1:-1] "What was delivered";
              AddressableEntity from [0:1];
              AddressableEntity to[1:-1];
              Privacy.Privacy.General.TimeWindow  when [1:-1] "When the delivery occurred. Could be over multiple periods. ";
            };
          };
        };
      };`
    })
  })
})