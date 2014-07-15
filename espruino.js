if (Meteor.isClient) {
    Template.espruino.events({
        'click #led1': function () {
            Meteor.call("toggleLed", "LED1");
        },
        'click #led2': function () {
            Meteor.call("toggleLed", "LED2");
        },
        'click #led3': function () {
            Meteor.call("toggleLed", "LED3");
        }
    });
}

if (Meteor.isServer) {
    var comPort = "COM10";
    var nodeEspruino = Meteor.require("node-espruino");
    var espruino = nodeEspruino.espruino({
        comPort: comPort
    });

    Meteor.startup(function () {
        // code to run on server at startup
        espruino.open(function() {
            [1, 2, 3].forEach(function(n) {
                espruino.command('LED'+n+'.set()', function() {
                    setTimeout(function() {
                        espruino.command('LED'+n+'.reset()', function(){});
                    }, 1500);
                });
            });
        });
    });

    Meteor.methods({
        toggleLed: function(pin) {
            espruino.command("digitalRead(" + pin + ");", function(result) {
                var v = (result == 0) ? 1 : 0;
                espruino.command("digitalWrite(" + pin + ", " + v + ");", function() {})
            })
        }
    });
}
