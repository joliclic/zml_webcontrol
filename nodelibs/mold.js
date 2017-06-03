'use strict';

var fs = require('fs');

function Mold(aBody) {
    this.setBody(aBody);
}

Mold.prototype = {
    _body: '',
    
    _replacements: [],
    
    setBody: function mold_setBody(aTxt) {
        if (aTxt) {
            this._body = aTxt.toString();
        } else {
            this._body = "";
        }
    },
    
    setBodyFromFileSync: function mold_setBodyFromFileSync(aFromPath) {
        var txt = fs.readFileSync(aFromPath, 'utf8');
        this.setBody(txt);
    },
    
    addReplacement:
    function mold_addReplacement(aStartMarker, aEndMarker, aStr) {
        this._replacements.push([aStartMarker, aEndMarker, aStr]);
    },
    
    resetReplacements: function mold_resetReplacements() {
        this._replacements = [];
    },
    
    render: function mold_render() {
        var txt = this._body;
        
        var r;
        var match = null;
        var start, end;
        for (var i = 0, l = this._replacements.length; i < l; i++) {
            r = this._replacements[i];
            match = r[0].exec(txt);
            if (!match)
                continue;
            start = match.index + match[0].length;
            
            match = r[1].exec(txt);
            if (!match)
                continue;
            end = match.index;
            
            txt =
                txt.substring(0, start) +
                r[2] +
                txt.substring(end);
        }
        
        return txt;
    },
    
    renderToFileSync: function mold_renderToFileSync(aPath) {
        var txt = this.render();
        fs.writeFileSync(aPath, txt, {encoding: 'utf8'});
    }
};

module.exports = Mold;
