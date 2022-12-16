import chalk from 'chalk';
import { Command } from 'commander';
//import { File } from '../language-server/generated/ast';
import { UniversalDataDefinitionLanguageLanguageMetaData } from '../language-server/generated/module';
import { createUniversalDataDefinitionLanguageServices } from '../language-server/universal-data-definition-language-module';
import { extractDocument } from './cli-util';
//import { generateJavaScript } from './generator';
import { NodeFileSystem } from 'langium/node';

// export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
//     const services = createUniversalDataDefinitionLanguageServices(NodeFileSystem).UniversalDataDefinitionLanguage;
//     const model = await extractAstNode<Model>(fileName, services);
//     const generatedFilePath = generateJavaScript(model, fileName, opts.destination);
//     console.log(chalk.green(`JavaScript code generated successfully: ${generatedFilePath}`));
// };

export type GenerateOptions = {
    destination?: string;
}

/**
 * Parse and validate a program written in our language.
 * Verifies that no lexer or parser errors occur.
 * Implicitly also checks for validation errors while extracting the document
 *
 * @param fileName Program to validate
 */
export const parseAndValidate = async (fileName: string): Promise<void> => {
    // retrieve the services for our language
    const services = createUniversalDataDefinitionLanguageServices(NodeFileSystem).UniversalDataDefinitionLanguage
    // extract a document for our program
    const document = await extractDocument(fileName, services);
    // extract the parse result details
    const parseResult = document.parseResult;
    // verify no lexer, parser, or general diagnostic errors show up
    if (parseResult.lexerErrors.length === 0 && 
        parseResult.parserErrors.length === 0
    ) {
        console.log(chalk.green(`Parsed and validated ${fileName} successfully!`));
    } else {
        console.log(chalk.red(`Failed to parse and validate ${fileName}!`));
    }
};

export default function(): void {
    const program = new Command();

    program
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        .version(require('../../package.json').version);

    const fileExtensions = UniversalDataDefinitionLanguageLanguageMetaData.fileExtensions.join(', ');
    program
        .command('parseAndValidate')
        .argument('<file>', `source file to parse & validate (possible file extensions: ${fileExtensions})`)
        .description('Indicates where a program parses & validates successfully, but produce no output code')
        .action(parseAndValidate);
        // program
        // .command('generate')
        // .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        // .option('-d, --destination <dir>', 'destination directory of generating')
        // .description('generates JavaScript code that prints "Hello, {name}!" for each greeting in a source file')
        // .action(generateAction);

    program.parse(process.argv);
}
