#!/usr/bin/env node

'use strict';

var path = require('path');
var fs = require('fs');
//var fse = require('fs-extra');
//var util = require('util');
//var Mold = require('./nodelibs/mold');
var less = require('less');
var l10n = require('./nodelibs/l10n');

var cfg = {
    compressCSS: false,
    
    src_dir: path.join('.', 'src'),
    
    src_css_dir: path.join('.', 'src', 'css'),
    
    src_l10n_dir: path.join('.', 'src', 'l10n'),
    
    target_dir: path.join('.', 'www'),
};

function compile_css(aSrc) {
    var src = fs.readFileSync(aSrc, 'utf8');
    var options = {
        compress: cfg.compressCSS,
        paths: path.dirname(aSrc),
        syncImport: true
    };
    
    var rv = '';
    less.render(src, options, function(aError, aOutput) {
        if (aError) {
            less.writeError(aError, {color: true});
            console.log('error less.render: ' + aError);
            return false;
        }
        rv = aOutput.css;
    });
    
    return rv;
}

function compile_css_to(aSrc, aDest) {
    var src = fs.readFileSync(aSrc, 'utf8');
    var options = {
        compress: cfg.compressCSS,
        paths: path.dirname(aSrc)
    };
    
    less.render(src, options, function(aError, aOutput) {
        if (aError) {
            less.writeError(aError, {color: true});
            //console.log('error less.render: ' + aError);
            return;
        }
        
        fs.writeFileSync(aDest, aOutput.css, {encoding: 'utf8'});
        console.log('css file created: ' + aDest);
    });
}

var cssSrc = path.join(cfg.src_css_dir, 'zml.less');
var cssDest = path.join(cfg.target_dir, 'zml.css');
//compile_css_to(cssSrc, cssDest);
var styles = compile_css(cssSrc);

var htmlSrcPath = path.join(cfg.src_dir, 'zml.html');
var html = fs.readFileSync(htmlSrcPath, 'utf8');
var jsSrcPath = path.join(cfg.src_dir, 'zml.js');
var js = fs.readFileSync(jsSrcPath, 'utf8');
var jsconfig = '';
var jsconfigSrcPath = path.join(cfg.src_dir, 'config.js');
if (!fs.existsSync(jsconfigSrcPath)) {
    console.log('config.js NOT exists');
    jsconfigSrcPath = path.join(cfg.src_dir, 'config.default.js');
    if (!fs.existsSync(jsconfigSrcPath)) {
        throw "Error: no JS config file found!";
    }
} else {
    console.log('config.js exists');
}
jsconfig = fs.readFileSync(jsconfigSrcPath, 'utf8') || '';

html = html.replace(/^\s*(\/\*)?\s*@@_STYLES_@@\s*(\*\/)?/m, styles);
// the js can content special pattern used by String.prototype.replace, like
// '$$'. The solution is to use a function as replacement.
html = html.replace(/^\s*(\/\/)?\s*@@_JS_@@\s*/m, function(){ return js});
html = html.replace(/^\s*(\/\/)?\s*@@_INCLUDE_CONFIG_@@\s*/m,
                    function(){ return jsconfig});

fs.readdirSync(cfg.src_l10n_dir).forEach(file => {
    var lang = file;
    var langdir = path.join(cfg.src_l10n_dir, lang);
    if (!fs.lstatSync(langdir).isDirectory())
        return;
    
    var dictFile = path.join(langdir, 'zml.properties');
    if (!fs.existsSync(dictFile))
        return;
    
    var dict = l10n.getPropertiesFromFileSync(dictFile);
    if (!dict) {
        console.log('failed to parse the ' + lang + ' properties file !');
        return;
    }
    
    var localized = l10n.localize(html, dict, '\\{\\{\\s*', '\\s*\\}\\}');
    var htmlDestFile = path.join(cfg.target_dir, 'zml_' + lang + '.html');
    fs.writeFileSync(htmlDestFile, localized, {encoding: 'utf8'});
    
    console.log('zml_' + lang + '.html generated');
})
