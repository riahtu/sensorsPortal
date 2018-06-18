var xlsPop;
var fileName;

define(['xlsx-populate'], function (XlsxPopulate) {
    xlsPop = XlsxPopulate;

    return xlsOut;
}
);


function xlsOut(jsonArray, xlsName) {
    fileName = xlsName || "out.xlsx";
    let arrOut = [];
    if (jsonArray[0]) {
        let arrTemp = [];
        for (var key in jsonArray[0]) {
            if (jsonArray[0].hasOwnProperty(key)) {
                arrTemp.push(key);
            }
        }
        arrOut.push(arrTemp);
    }

    jsonArray.forEach(function (obj) {
        let arrTemp = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                arrTemp.push(obj[key]);
            }
        }
        arrOut.push(arrTemp);
    });

    generateBlob(arrOut);

}

function getWorkbook() {
    return xlsPop.fromBlankAsync();
}

function generate(type, testArr) {
    return getWorkbook()
            .then(function (workbook) {
                const r = workbook.sheet(0).range("A1:T100");

                r.value(testArr);
                workbook.sheet(0).row(1).style({bold: true, fontColor: 'ff0000'});
                return workbook.outputAsync(type);
            });
}

function generateBlob(testArr) {
    return generate('', testArr)
            .then(function (blob) {
                if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    window.navigator.msSaveOrOpenBlob(blob, "out.xlsx");
                } else {
                    var url = window.URL.createObjectURL(blob);
                    var a = document.createElement("a");
                    document.body.appendChild(a);
                    a.href = url;
                    a.download = fileName;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                }
            })
            .catch(function (err) {
                alert(err.message || err);
                throw err;
            });
}