'use strict';

var fs = require('fs');
var expat = require('node-expat')
var propertiesParser = require('properties-parser');

var l10n = {};

//const DOCTYPE_HEADER = "<?xml version=\"1.0\"?>\n<!DOCTYPE window [\n";
const DOCTYPE_HEADER = "<!DOCTYPE window [\n";
const DOCTYPE_FOOTER = "\n]>";

l10n.getEntities = function (aXMLString, aOptions) {
    if (aOptions && ('addDoctypeDecl' in aOptions) && aOptions.addDoctypeDecl)
        aXMLString = DOCTYPE_HEADER + aXMLString + DOCTYPE_FOOTER;
    
    var parser = new expat.Parser('UTF-8');
    var entities = {};
    parser.on(
        'entityDecl',
        function (entityName, isParameterEntity, value, base, systemId,
                  publicId, notationName) {
            entities[entityName] = value;
            //console.log(entityName + ': ' + value);
        }
    )
    var res = parser.parse(aXMLString);
    if (!res)
        return false;
    
    return entities;
}

l10n.getEntitiesFromFileSync = function (aPath, aOptions) {
    if (!fs.existsSync(aPath))
        return false;

    var xml = fs.readFileSync(aPath, 'utf8');
    
    return l10n.getEntities(xml, aOptions);
}

l10n.getProperties = function (aPropertiesString) {
    return propertiesParser.parse(aPropertiesString);
}

l10n.getPropertiesFromFileSync = function (aPath) {
    if (!fs.existsSync(aPath))
        return false;

    var str = fs.readFileSync(aPath, 'utf8');
    
    return l10n.getProperties(str);
}

l10n.escapeRegExp = function escapeRegExp(string) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Using_special_characters
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

l10n.replaceAll =
function (aSearchString, aReplace, aSubject, aStartMarker, aEndMarker) {
    if (!aStartMarker)
        aStartMarker = '';
    if (!aEndMarker)
        aEndMarker = '';
    
    aSearchString = aStartMarker + l10n.escapeRegExp(aSearchString) + aEndMarker;
    var re = new RegExp(aSearchString, 'g');
    
    return aSubject.replace(re, aReplace);
}

l10n.localize = function (aString, aDict, aStartMarker, aEndMarker) {
    // aDict = {'key1: 'value1', 'key2: 'value2', ...}
    if (!aStartMarker)
        aStartMarker = '';
    if (!aEndMarker)
        aEndMarker = '';
    
    var str;
    for (var key in aDict) {
        aString = l10n.replaceAll(key, aDict[key], aString, aStartMarker,
                                  aEndMarker);
    }
    
    return aString;
}

module.exports = l10n;
