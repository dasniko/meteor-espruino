var nodeEspruino = Meteor.require("node-espruino");
var espruino = nodeEspruino.espruino({
    comPort: config.comPort
});

var noop = function() {};

var ledStatus = {LED1: 0, LED2: 0, LED3: 0};

Meteor.startup(function () {
    espruino.open(function() {
        [1, 2, 3].forEach(function(n) {
            espruino.command('LED'+n+'.set()', function() {
                setTimeout(function() {
                    espruino.command('LED'+n+'.reset()', noop);
                }, 100);
            });
        });
    });
});

Meteor.methods({
    toggleLed: function(pin) {
        espruino.command("digitalRead(" + pin + ");", function(result) {
            var status = (result == 0) ? 1 : 0;
            espruino.command("digitalWrite(" + pin + ", " + status + ");", function() {
                _setLedStatus(pin, status);
            });
        });
    },
    getLedStatus: function() {
        return ledStatus;
    }
});

_setLedStatus = function(pin, status) {
    ledStatus[pin] = status;
};