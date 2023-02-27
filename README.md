# universal-data-definition-language
Typescript / Langium version of UDDL

The functionality here should be identical to the Java UDDL repo - but it will trail it occasionally because the Langium files here are generated from the XText / Java version.

Currently this repo has no dependencies so it can be edited/ modified / etc. without need to go through the Eclipse install process required by the XText/Java version.

Instead, to process this, you should:
1. Install [Langium](https://langium.org)
1. Install [VS Code](https://code.visualstudio.com/Download)
1. Install the following VS Code Extensions:
* Langium

1. You might want to also install the following VS Code Extensions:
* 


**Your Interview will consist of creating the text formatting capability of the Langium / Typescript UDDL tool**


## Modifying the code
The code that formats the UDDL file should be created in the
```
./src/language-server/
```

directory.

For an example of what is needed, see the [XText/XTend version of this same task](https://github.com/Epistimis/UDDL/blob/master/INTERVIEW.md).

Your task is to use what you see as an example and create the code to properly format 
- [ ] Everything you see in the existing UDDL file; 
- [ ] One or more larger UDDL files that contains at least 3 of each of the things described in the Uddl.xtext file.  

Note that the example UDDL file you see is already partially formatted. That won't always be the case. You should create sample files that take worst 
case formatted files (there are at least 2 worst cases - at opposite ends of the spectrum) and make sure your formatting works on them as well. You 
can create those worst case formatted files starting from the sample file if you want.

## What you should submit
Take as long as you want creating test files, and updating and testing your code changes. I don't expect you to completely finish though you're certainly 
welcome to if you want. When you decide to stop, create a pull request that includes your code changes and any additional 
test UDDL files you created. You should add a text/.md file describing what you did, why you did it, how long it took and anything else you want me to know.
Feel free to include info on any additional research you needed to do.

## What I'm looking for

1. Can you figure out what test files you need? And a good way to create them?
1. Why did I say that larger UDDL files should contain at least 3 of each of the things?
1. What are worst cases - and why are they worst cases? Are there more than 2?
1. What code changes did you make? Do they work? What do they do? What do they look like?

## ***NOTE*** 
I have not included with this any documentation explaining what the content of the UDDL means. It isn't necessary for the purpose of this exercise.
Your focus is on making the file format properly.  If you do happen to figure out what UDDL does, let me know what you found. That's bonus points.
