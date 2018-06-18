define(['ojs/ojcore', 'knockout', 'jquery'],
        function (oj, ko, $)
        {
            function fetchLkp(url) {
                return $.getJSON(`js/data/lkps/${url}.json`);
            }
            
            

            return fetchLkp;
        });