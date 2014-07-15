if (Meteor.isClient) {
    Template.espruino.events({
        'click input': function (e) {
            Meteor.call("toggleLed", e.target.id.toUpperCase());
        }
    });
}

if (Meteor.isServer) {
    var comPort = "COM10";
    var nodeEspruino = Meteor.require("node-espruino");
    var espruino = nodeEspruino.espruino({
        comPort: comPort
    });

    var noop = function() {};

    Meteor.startup(function () {
        // code to run on server at startup
        espruino.open(function() {
            [1, 2, 3].forEach(function(n) {
                espruino.command('LED'+n+'.set()', function() {
                    setTimeout(function() {
                        espruino.command('LED'+n+'.reset()', noop);
                    }, 1500);
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
