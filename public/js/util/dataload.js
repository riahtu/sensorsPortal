define(['ojs/ojcore', 'knockout', 'jquery'],
        function (oj, ko, $)
        {
            function ajaxService(url, type, payLoad) {
                if (!type) {
                    type = 'GET';
                }
                $.ajaxSetup({contentType: "application/json; charset=utf-8"});
                return   $.ajax({
                    url: url,
                    type: type,
                    data: payLoad,
                    datatype: "json"
                });
            }
            return {
                fetchData: ajaxService,
                postData: ajaxService
            };
        });


                