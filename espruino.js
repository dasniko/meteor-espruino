if (Meteor.isClient) {
    var ledDep = new Deps.Dependency;

    Deps.autorun(function() {
        ledDep.depend();
        Meteor.setTimeout(function() {
            Meteor.call("getLedStatus", function(err, ledStatus) {
                for (var led in ledStatus) {
                    if (ledStatus.hasOwnProperty(led)) {
                        Session.set("status_" + led, ledStatus[led]);
                    }
                }
            });
        }, 20);
    });

    Template.espruino.events({
        'click i.fa': function (e) {
            var id = e.target.id;
            Meteor.call("toggleLed", id, function() {
                ledDep.changed();
            });
        }
    });

    Template.espruino.statusLed1 = function() {
        return _statusLed(1);
    };
    Template.espruino.statusLed2 = function() {
        return _statusLed(2);
    };
    Template.espruino.statusLed3 = function() {
        return _statusLed(3);
    };
    _statusLed = function(led) {
        return "fa-circle" + (Session.equals("status_LED" + led, 1) ? "" : "-o");
    };
}

if (Meteor.isServer) {
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

}
