function exportToExcel(data){
    //console.log($(this).html());
    var excel="<table><tr>";
    // Header
    $.each(data.headers, function(i, value) {
        excel += "<td>" + parseString(value)+ "</td>";
    });

    excel += '</tr>';

    // Row Vs Column
    var rowCount=1;
    $.each(data.data, function(i, value) {
        if( value.length > 0 && value[0].match("Grand Total") ) {
            rowCount++;
            return;
        }
        excel += "<tr>";
        var colCount=0;

        $.each(value, function(j, value2) {
            excel += "<td>"+parseString(value2)+"</td>";
            colCount++;
        });
        rowCount++;
        excel += '</tr>';
    });
    excel += '</table>'

    var excelFile = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:"+'excel'+"' xmlns='http://www.w3.org/TR/REC-html40'>";
    excelFile += "<head>";
    excelFile += "<!--[if gte mso 9]>";
    excelFile += "<xml>";
    excelFile += "<x:ExcelWorkbook>";
    excelFile += "<x:ExcelWorksheets>";
    excelFile += "<x:ExcelWorksheet>";
    excelFile += "<x:Name>";
    excelFile += "{worksheet}";
    excelFile += "</x:Name>";
    excelFile += "<x:WorksheetOptions>";
    excelFile += "<x:DisplayGridlines/>";
    excelFile += "</x:WorksheetOptions>";
    excelFile += "</x:ExcelWorksheet>";
    excelFile += "</x:ExcelWorksheets>";
    excelFile += "</x:ExcelWorkbook>";
    excelFile += "</xml>";
    excelFile += "<![endif]-->";
    excelFile += "</head>";
    excelFile += "<body>";
    excelFile += excel;
    excelFile += "</body>";
    excelFile += "</html>";


    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    // If Internet Explorer
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)){

        var tempFrame = $('<iframe></iframe>')
            .css("display", "none")
            .attr("id", "ieExcelFrame")
            .appendTo("body");

        ieExcelFrame.document.open("txt/html","replace");
        ieExcelFrame.document.write(excelFile);
        ieExcelFrame.document.close();
        ieExcelFrame.focus();
        ieExcelFrame.document.execCommand("SaveAs",true,"exportData.xls");

        tempFrame.remove();
    }
    else{          //other browsers
        var base64data = "base64," + $.base64.encode(excelFile);
        window.open('data:application/vnd.ms-excel;filename=exportData.doc;' + base64data);
    }
}

function exportToPDF(data){

    var defaults = {
        separator: ',',
        ignoreColumn: [],
        tableName:'yourTableName',
        pdfFontSize:6,
        pdfLeftMargin:20
    };

    var doc = new jsPDF('l','pt', 'letter', true);
    var widths = [];
    // Header
    var startColPosition=defaults.pdfLeftMargin;

    $.each(data.headers, function(index, value) {
        var currentLength = parseString(value).length * 4.5;
        if( !widths[index] || widths[index] < currentLength )
            widths[index] = Math.max(30,currentLength);
    });

    $.each(data.data, function(i, value) {
        if( value.length > 0 && value[0].match("Grand Total") ) {
            return;
        }
        $.each(value, function(index, value2) {
            var currentLength = parseString(value2).length * 4.5;
            if( !widths[index] || widths[index] < currentLength )
                widths[index] = Math.max(30,currentLength);
        });
    });

    var sumOfColumnWidths = widths.reduce(function(prev,current){ return prev + current; });
    if( sumOfColumnWidths > 752 ){
        var multiplier = 752/sumOfColumnWidths;
        doc.setFontSize(multiplier * defaults.pdfFontSize);
        for( var i=0; i<widths.length; i++ ){
            widths[i] = widths[i] * multiplier;
        }
    }
    else{
        doc.setFontSize(defaults.pdfFontSize);
    }


    $.each(data.headers, function(index, value) {
        var colPosition = widths.reduce(function(prev,current,idx){
            return idx < index ? prev + current : prev;
        }, startColPosition);
        doc.text(colPosition,20, parseString(value));
    });

    // Row Vs Column
    var startRowPosition = 20; var page =1;var rowPosition=0;
    var rowCalc = 1;

    $.each(data.data, function(i, value) {
        if( value.length > 0 && value[0].match("Grand Total") ) {
            return;
        }
        rowCalc++;

        if (rowCalc % 50 == 0){
            doc.addPage();
            page++;
            rowCalc = 1;
        }
        rowPosition=(startRowPosition + (rowCalc * 10));

        $.each(value, function(index, value2) {
            var colPosition = widths.reduce(function(prev,current,idx){
                return idx < index ? prev + current : prev;
            }, startColPosition);
            doc.text(colPosition,rowPosition, parseString(value2));
        });
    });

    // Output as Data URI
    doc.output('save', 'AMI-table.pdf');

}

function parseString(data){
    if( typeof data !== "string" ) {
        if ( data && data.toString )
            data = data.toString();
        else
            return "";
    }

    var content_data = data.trim();

    content_data = content_data.replace(/[^\x00-\x7F]/g, "");
    content_data = content_data.substr(0,20);

    //if(defaults.escape == 'true'){
    //	content_data = escape(content_data);
    //}



    return content_data;
}