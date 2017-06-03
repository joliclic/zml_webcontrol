'use strict';

var gServers = [
    {
        name: 'PifLeChien',
        //url: 'ws:/192.168.2.31:81',
        url: 'ws:/192.168.0.42:81',
        websocket: null,
    },
];

function $(expr) {
    return document.querySelector(expr);
}

function $$(expr) {
    return Array.from(document.querySelectorAll(expr));
}

function sendCommand(str) {
    gServers.forEach(function(server) {
        if (server.websocket && server.websocket.readyState == WebSocket.OPEN) {
            server.websocket.send(str)
        } else {
            updateStatus();
        }
    });
}

function updateStatus() {
    var nb_servers = gServers.length;
    var nb_servers_ok = 0;
    
    gServers.forEach(function(server) {
        if (server.websocket && server.websocket.readyState == WebSocket.OPEN) {
            nb_servers_ok++;
            if (server.status_box) {
                server.status_box.innerHTML =
                    server.name + ' :' +
                    '<span class="status-txt status-ok">OK</span>';
            }
        } else if (server.status_box) {
            server.status_box.innerHTML =
                server.name + ' :' +
                '<span class="status-txt status-alert">KO</span>';
        }
    });
    
    var main_status_box = $('#main-status-box');
    if (!main_status_box)
        return;
    
    if (nb_servers_ok === 0) {
        main_status_box.innerHTML =
            '<big class="status-txt status-alert">! KO !</big>';
    } else if (nb_servers === nb_servers_ok) {
        main_status_box.innerHTML =
            '<big class="status-txt status-ok">OK</big>';
    } else if (nb_servers_ok < nb_servers) {
        main_status_box.innerHTML =
            '<big class="status-txt status-warning">warning !</big>';
    }
}

function init() {
    var textarea = $('#responses-textarea');
    if (textarea)
        textarea.value = ''
    
    updateStatus();
    
    var substatus_box = $('#substatus-box');
    gServers.forEach(function(server) {
        if (substatus_box) {
            server.status_box = document.createElement('div');
            server.status_box.className = 'substatus';
            substatus_box.appendChild(server.status_box);
        }
        server.websocket = new WebSocket(server.url);
        server.websocket.addEventListener('open', function (evt) {
            updateStatus();
        });
        var sname = server.name;
        server.websocket.addEventListener('message', function (evt) {
            var textarea = $('#responses-textarea');
            if (textarea) {
                textarea.value =
                    sname + ': ' + "\n" + evt.data + "\n\n" + textarea.value;
            }
        });
    });
    
    var mutable_bt = $('#mutable-cmd-bt');
    var mutable_input = $('#mutable-cmd-input');
    if (mutable_bt && mutable_input) {
        mutable_bt.addEventListener('click', function(evt) {
            var cmd = mutable_input.value;
            if (cmd)
                sendCommand(cmd);
        });
    }
    
    $$('.cmd-bt').forEach(function(elt) {
        elt.addEventListener('click', function(evt) {
            var cmd = this.getAttribute('data-cmd');
            if (cmd)
                sendCommand(cmd);
        });
    });
    
    $$('.cmd-slider').forEach(function(elt) {
        elt.addEventListener('change', function(evt) {
            var cmd = this.getAttribute('data-cmd');
            if (cmd)
                sendCommand(cmd + this.value);
        });
    });
    
    setInterval(function() {updateStatus}, 1000);
}


document.addEventListener('DOMContentLoaded', function(e) {
    //console.log("DOM loaded");
    init();
});

