"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.languages = {
    actionscript: { ids: ['nextgenas'], defaultExtension: 'as' },
    ansible: { ids: ['ansible'], defaultExtension: 'ansible' },
    anyscript: { ids: ['anyscript'], defaultExtension: 'any' },
    apache: { ids: ['apacheconf'], defaultExtension: 'htaccess' },
    apib: { ids: ['apiblueprint'], defaultExtension: 'apib' },
    applescript: { ids: ['applescript'], defaultExtension: 'applescript' },
    asp: { ids: ['asp', 'asp (html)'], defaultExtension: 'asp' },
    assembly: { ids: ['arm'], defaultExtension: 'asm' },
    autohotkey: { ids: ['ahk'], defaultExtension: 'ahk' },
    autoit: { ids: ['autoit'], defaultExtension: 'au3' },
    bat: { ids: 'bat', defaultExtension: 'bat' },
    blade: { ids: ['blade', 'laravel-blade'], defaultExtension: 'blade.php' },
    bolt: { ids: ['bolt'], defaultExtension: 'bolt' },
    c: { ids: 'c', defaultExtension: 'c' },
    cabal: { ids: ['cabal'], defaultExtension: 'cabal' },
    cake: { ids: ['cake'], defaultExtension: 'cake' },
    cfc: { ids: ['cfc'], defaultExtension: 'cfc' },
    cfm: { ids: ['cfmhtml'], defaultExtension: 'cfm' },
    clojure: { ids: 'clojure', defaultExtension: 'clojure' },
    cmake: { ids: 'cmake', defaultExtension: 'cmake' },
    cmakecache: { ids: 'cmake-cache', defaultExtension: 'CMakeCache.txt' },
    cobol: { ids: ['cobol'], defaultExtension: 'cbl' },
    coffeescript: { ids: 'coffeescript', defaultExtension: 'coffee' },
    coldfusion: { ids: ['lang-cfml'], defaultExtension: 'cfml' },
    cpp: { ids: 'cpp', defaultExtension: 'cpp' },
    crystal: { ids: ['crystal'], defaultExtension: 'cr' },
    csharp: { ids: ['csharp'], defaultExtension: 'cs' },
    css: { ids: 'css', defaultExtension: 'css' },
    cucumber: { ids: ['feature'], defaultExtension: 'feature' },
    dart: { ids: ['dart'], defaultExtension: 'dart' },
    diff: { ids: 'diff', defaultExtension: 'diff' },
    dlang: { ids: ['d', 'dscript', 'dml', 'sdl', 'diet'], defaultExtension: 'd' },
    dockerfile: { ids: 'dockerfile', defaultExtension: 'dockerfile' },
    dylanlang: { ids: ['dylan', 'dylan-lid'], defaultExtension: 'dylan' },
    dustjs: { ids: ['dustjs'], defaultExtension: 'dust' },
    elixir: { ids: ['elixir', 'Eex', 'HTML (Eex)'], defaultExtension: 'ex' },
    elm: { ids: ['elm'], defaultExtension: 'elm' },
    erb: { ids: ['erb'], defaultExtension: 'erb' },
    erlang: { ids: ['erlang'], defaultExtension: 'erl' },
    fortran: { ids: ['fortran', 'fortran-modern'], defaultExtension: 'f' },
    freemarker: { ids: ['ftl'], defaultExtension: 'ftl' },
    fsharp: { ids: 'fsharp', defaultExtension: 'fs' },
    gamemaker: { ids: 'gml-gms', defaultExtension: 'gml' },
    gamemaker2: { ids: 'gml-gms2', defaultExtension: 'gml' },
    gamemaker81: { ids: 'gml-gm81', defaultExtension: 'gml' },
    git: { ids: ['git-commit', 'git-rebase'], defaultExtension: 'git' },
    glsl: { ids: 'glsl', defaultExtension: 'glsl' },
    go: { ids: 'go', defaultExtension: 'go' },
    godot: { ids: 'gdscript', defaultExtension: 'gd' },
    graphql: { ids: ['graphql'], defaultExtension: 'gql' },
    graphviz: { ids: ['dot'], defaultExtension: 'gv' },
    groovy: { ids: 'groovy', defaultExtension: 'groovy' },
    haml: { ids: ['haml'], defaultExtension: 'haml' },
    handlebars: { ids: 'handlebars', defaultExtension: 'hbs' },
    harbour: { ids: 'harbour', defaultExtension: 'prg' },
    haskell: { ids: ['haskell'], defaultExtension: 'hs' },
    haxe: { ids: ['haxe', 'hxml', 'Haxe AST dump'], defaultExtension: 'haxe' },
    hlsl: { ids: 'hlsl', defaultExtension: 'hlsl' },
    html: { ids: 'html', defaultExtension: 'html' },
    ini: { ids: 'ini', defaultExtension: 'ini' },
    latex: { ids: ['latex'], defaultExtension: 'tex' },
    java: { ids: 'java', defaultExtension: 'java' },
    javascript: { ids: 'javascript', defaultExtension: 'js' },
    javascriptreact: { ids: 'javascriptreact', defaultExtension: 'jsx' },
    jinja: { ids: ['jinja'], defaultExtension: 'jinja' },
    json: { ids: 'json', defaultExtension: 'json' },
    julia: { ids: ['julia', 'juliamarkdown'], defaultExtension: 'jl' },
    kos: { ids: ['kos'], defaultExtension: 'ks' },
    kotlin: { ids: ['kotlin'], defaultExtension: 'kt' },
    lisp: { ids: ['lisp'], defaultExtension: 'lisp' },
    literatehaskell: { ids: ['literate haskell'], defaultExtension: 'lhs' },
    less: { ids: 'less', defaultExtension: 'less' },
    lua: { ids: 'lua', defaultExtension: 'lua' },
    makefile: { ids: 'makefile', defaultExtension: 'mk' },
    markdown: { ids: 'markdown', defaultExtension: 'md' },
    marko: { ids: ['marko'], defaultExtension: 'marko' },
    matlab: { ids: ['matlab'], defaultExtension: 'mat' },
    mjml: { ids: ['mjml'], defaultExtension: 'mjml' },
    mson: { ids: ['mson'], defaultExtension: 'mson' },
    nim: { ids: ['nim', 'nimble'], defaultExtension: 'nim' },
    nsis: { ids: ['nsis', 'nfl', 'nsl', 'bridlensis'], defaultExtension: 'nsi' },
    nunjucks: { ids: ['nunjucks'], defaultExtension: 'nunjucks' },
    objectivec: { ids: 'objective-c', defaultExtension: 'm' },
    objectivecpp: { ids: 'objective-cpp', defaultExtension: 'mm' },
    ocaml: { ids: ['ocaml', 'ocamllex', 'menhir'], defaultExtension: 'ml' },
    pascal: { ids: ['pascal', 'objectpascal'], defaultExtension: 'pas' },
    perl: { ids: ['perl', 'perl6'], defaultExtension: 'pl' },
    php: { ids: 'php', defaultExtension: 'php' },
    plaintext: { ids: 'plaintext', defaultExtension: 'txt' },
    plsql: { ids: ['plsql', 'oracle'], defaultExtension: 'ddl' },
    polymer: { ids: ['polymer'], defaultExtension: 'polymer' },
    postcss: { ids: ['postcss'], defaultExtension: 'pcss' },
    powershell: { ids: 'powershell', defaultExtension: 'ps1' },
    prolog: { ids: ['prolog'], defaultExtension: 'pro' },
    properties: { ids: 'properties', defaultExtension: 'properties' },
    protobuf: { ids: ['proto3', 'proto'], defaultExtension: 'proto' },
    pug: { ids: 'jade', defaultExtension: 'pug' },
    puppet: { ids: ['puppet'], defaultExtension: 'pp' },
    purescript: { ids: ['purescript'], defaultExtension: 'purs' },
    python: { ids: 'python', defaultExtension: 'py' },
    qlik: { ids: ['qlik'], defaultExtension: 'qvs' },
    r: { ids: 'r', defaultExtension: 'r' },
    razor: { ids: 'razor', defaultExtension: 'cshtml' },
    raml: { ids: ['raml'], defaultExtension: 'raml' },
    reason: { ids: 'reason', defaultExtension: 're' },
    restructuredtext: { ids: ['restructuredtext'], defaultExtension: 'rst' },
    riot: { ids: ['riot'], defaultExtension: 'tag' },
    robot: { ids: ['robot'], defaultExtension: 'robot' },
    ruby: { ids: 'ruby', defaultExtension: 'rb' },
    rust: { ids: 'rust', defaultExtension: 'rs' },
    sbt: { ids: ['sbt'], defaultExtension: 'sbt' },
    scala: { ids: ['scala'], defaultExtension: 'scala' },
    scss: { ids: 'scss', defaultExtension: 'scss' },
    shaderlab: { ids: 'shaderlab', defaultExtension: 'shader' },
    shellscript: { ids: 'shellscript', defaultExtension: 'sh' },
    slim: { ids: ['slim'], defaultExtension: 'slim' },
    smarty: { ids: ['smarty'], defaultExtension: 'tpl' },
    solidity: { ids: ['solidity'], defaultExtension: 'sol' },
    sqf: { ids: 'sqf', defaultExtension: 'sqf' },
    sql: { ids: 'sql', defaultExtension: 'sql' },
    stylus: { ids: ['stylus'], defaultExtension: 'styl' },
    swagger: { ids: ['Swagger', 'swagger'], defaultExtension: 'swagger' },
    swift: { ids: ['swift'], defaultExtension: 'swift' },
    swig: { ids: ['swig'], defaultExtension: 'swig' },
    terraform: { ids: ['terraform'], defaultExtension: 'tf' },
    tex: { ids: 'tex', defaultExtension: 'sty' },
    textile: { ids: ['textile'], defaultExtension: 'textile' },
    textmatejson: { ids: ['json-tmlanguage'], defaultExtension: 'JSON-tmLanguage' },
    textmateyaml: { ids: ['yaml-tmlanguage'], defaultExtension: 'YAML-tmLanguage' },
    toml: { ids: ['toml'], defaultExtension: 'toml' },
    twig: { ids: ['twig'], defaultExtension: 'twig' },
    typescript: { ids: 'typescript', defaultExtension: 'ts' },
    typescriptreact: { ids: 'typescriptreact', defaultExtension: 'tsx' },
    vb: { ids: 'vb', defaultExtension: 'vb' },
    vba: { ids: ['vba'], defaultExtension: 'cls' },
    vbscript: { ids: ['vbscript'], defaultExtension: 'wsf' },
    vhdl: { ids: ['vhdl'], defaultExtension: 'vhdl' },
    viml: { ids: ['viml'], defaultExtension: 'vim' },
    volt: { ids: ['volt'], defaultExtension: 'volt' },
    vue: { ids: ['vue'], defaultExtension: 'vue' },
    wxml: { ids: ['wxml'], defaultExtension: 'wxml' },
    xml: { ids: 'xml', defaultExtension: 'xml' },
    xsl: { ids: 'xsl', defaultExtension: 'xsl' },
    yaml: { ids: 'yaml', defaultExtension: 'yaml' },
    yang: { ids: ['yang'], defaultExtension: 'yang' },
};
//# sourceMappingURL=languages.js.map