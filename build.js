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

function compile_css(aSrc, aDest) {
    var css = fs.readFileSync(aSrc, 'utf8');
    var options = {
        compress: cfg.compressCSS,
        paths: path.dirname(aSrc)
    };
    
    less.render(css, options, function(aError, aOutput) {
        //console.log(css);
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
compile_css(cssSrc, cssDest);

