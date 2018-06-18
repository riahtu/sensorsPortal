/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'config'],
        function (oj, ko, $, config)
        {
//            function fetchData(url) {
////                return $.getJSON(url);
//                return     $.ajax({
//                    url: url,
//                    type: 'GET',
//                    dataType: 'json',
//                    beforeSend: function (xhr) {
//                        xhr.setRequestHeader('Authorization', config.token);
//                    }
//                });
//            }


            function doAjax(url, type, payLoad) {
                if (!type) {
                    type = 'GET';
                }
                $.ajaxSetup({contentType: "application/json; charset=utf-8"});
                return   $.ajax({
                    url: url,
                    type: type,
                    data: payLoad,
                    datatype: "json",
                    processData: false,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', config.token);

                    }
                });


            }




            return {fetchData: doAjax,
                postData: doAjax
            };
        });


                