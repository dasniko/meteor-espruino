if (Meteor.isClient) {
    Template.espruino.events({
        'click i.fa': function (e) {
            var id = e.target.id;
            Meteor.call("toggleLed", id.toUpperCase(), function(err, result) {
                console.log(id + ": " + result);
                Session.set("status_" + id, result);
            });
        }
    });

    Template.espruino.statusLed1 = function() {
        return _statusLed("led1");
    };
    Template.espruino.statusLed2 = function() {
        return _statusLed("led2");
    };
    Template.espruino.statusLed3 = function() {
        return _statusLed("led3");
    };
    _statusLed = function(led) {
        return "fa-circle" + (Session.equals("status_" + led, 1) ? "" : "-o");
    }
}

if (Meteor.isServer) {
    var nodeEspruino = Meteor.require("node-espruino");
    var espruino = nodeEspruino.espruino({
        comPort: config.comPort
    });

    var noop = function() {};

    Meteor.startup(function () {
        // code to run on server at startup
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
                var v = (result == 0) ? 1 : 0;
                espruino.command("digitalWrite(" + pin + ", " + v + ");", noop)
            })
        }
    });
}
