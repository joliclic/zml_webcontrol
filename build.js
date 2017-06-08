#!/usr/bin/env node

'use strict';

var path = require('path');
var fs = require('fs');
//var fse = require('fs-extra');
//var util = require('util');
//var Mold = require('./nodelibs/mold');
var less = require('less');

var cfg = {
    compressCSS: false,
    
    src_dir: path.join('.', 'src'),
    
    src_css_dir: path.join('.', 'src', 'css'),
    
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
compile_css_to(cssSrc, cssDest);
var styles = compile_css(cssSrc);

var htmlSrcPath = path.join(cfg.src_dir, 'zml.html');
var html = fs.readFileSync(htmlSrcPath, 'utf8');
var jsSrcPath = path.join(cfg.src_dir, 'zml.js');
var js = fs.readFileSync(jsSrcPath, 'utf8');

html = html.replace(/^\s*(\/\*)?\s*@@_STYLES_@@\s*(\*\/)?/m, styles);
// the js can content special pattern used by String.prototype.replace, like
// '$$'. The solution is to use a function as replacement.
html = html.replace(/^\s*(\/\/)?\s*@@_JS_@@\s*/m, function(){ return js});
var htmlDestFile = path.join(cfg.target_dir, 'zml.html');

fs.writeFileSync(htmlDestFile, html, {encoding: 'utf8'});
