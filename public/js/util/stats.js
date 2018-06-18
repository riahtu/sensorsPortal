define(
        function ()
        {
            function statsVM() {
                var self = this;
                self.arraySum = function (array) {
                    return array.reduce(function (tot, current) {
                        return tot + current;
                    });
                };

                self.meanValue = function (array) {
                    return self.arraySum(array) / array.length;
                };

                self.variance = function (array) {
                    var mean = self.meanValue(array);
                    return self.meanValue(array.map(function (num) {
                        return Math.pow(num - mean, 2);
                    }));
                };
            }

            return new statsVM();
        });


