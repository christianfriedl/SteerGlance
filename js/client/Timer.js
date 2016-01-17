(function(window){
    Timer = {
        times: {},
        start: function(name) {
            Timer.times[name] = { start: new Date(), end: null, diffMsec: null };
        },
        end: function(name) {
            var time = Timer.times[name];
            time.end = new Date();
            time.diffMsec = time.end - time.start;
        },
        log: function(name) {
            var time = Timer.times[name];
            console.log('Timer', name, 'diffMsec', time.diffMsec);
        }
    };

    window.SingleRowTable = SingleRowTable;
})(window);
