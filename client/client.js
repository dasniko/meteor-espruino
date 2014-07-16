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

UI.registerHelper("statusLed", function(pin) {
    return _statusLed(pin);
});
_statusLed = function(led) {
    return "fa-circle" + (Session.equals("status_LED" + led, 1) ? "" : "-o");
};