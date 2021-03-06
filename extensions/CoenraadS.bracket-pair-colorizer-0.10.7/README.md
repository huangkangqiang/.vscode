# Bracket Pair Colorizer

This extension allows matching brackets to be identified with colours. The user can define which characters to match, and which colours to use.

Screenshot:  
![Screenshot](https://github.com/CoenraadS/BracketPair/raw/master/images/example.png "Bracket Pair Colorizer")

-----------------------------------------------------------------------------------------------------------
## [Release Notes](https://github.com/CoenraadS/BracketPair/blob/master/CHANGELOG.md)

## Features

### User defined matching characters
> By default (), [], and {} are matched, however custom bracket characters can also be configured.

> A list of colors can be configured, as well as a specific color for orphaned brackets.

### Fast

> Bracket Pair Colorizer will only update during configurable idle time.

> Bracket Pair Colorizer will only update iterative changes to the document, caching already parsed lines.

-----------------------------------------------------------------------------------------------------------

## Settings

> `"bracketPairColorizer.timeOut"`  
Configure how long the editor should be idle for before updating the document.  
Set to 0 to disable.

> `"bracketPairColorizer.forceUniqueOpeningColor"`  
![Disabled](https://github.com/CoenraadS/BracketPair/raw/master/images/forceUniqueOpeningColorDisabled.png "forceUniqueOpeningColor Disabled")
![Enabled](https://github.com/CoenraadS/BracketPair/raw/master/images/forceUniqueOpeningColorEnabled.png "forceUniqueOpeningColor Enabled")

> `"bracketPairColorizer.forceIterationColorCycle"`  
![Enabled](https://github.com/CoenraadS/BracketPair/raw/master/images/forceIterationColorCycleEnabled.png "forceIterationColorCycle Enabled")

>`"bracketPairColorizer.contextualParsing"`  
Contextual parsing will ignore brackets in comments or strings.  
Contextual parsing has experimental support for the following languages:  
```
- c
- clojure (partial, wip)
- cpp
- csharp
- css
- dart
- html
- java
- javascript
- javascriptreact
- less
- php
- powershell
- python
- r
- ruby
- scss
- swift
- typescript
```

>`"bracketPairColorizer.colorMode"`  
Consecutive brackets share a color pool for all bracket types  
Independent brackets allow each bracket type to use its own color pool  
![Consecutive](https://github.com/CoenraadS/BracketPair/raw/master/images/consecutiveExample.png "Consecutive Example")
![Independent](https://github.com/CoenraadS/BracketPair/raw/master/images/independentExample.png "Independent Example")

> `"bracketPairColorizer.consecutivePairColors"`   
> A new bracket pair can be configured by adding it to the array.  
> Example for matching '<>'
>````
>[
>    "()",
>    "[]",
>    "{}",
>    "<>",                  // New bracket
>    [                      // CSS Color cycle
>        "Gold",
>        "Orchid",
>        "LightSkyBlue"
>    ],
>    "Red"                  // Orphaned bracket color
>]
>````

> `"bracketPairColorizer.independentPairColors"`   
> A new bracket pair can be configured by adding it to the array.  
> Example for matching '<>'
>````
>[
>    "<>",                   // New bracket
>    [                       // CSS Color cycle
>        "Gold",
>        "Orchid",
>        "LightSkyBlue"
>    ],
>    "Red"                   // Orphaned bracket color
>]
>````



