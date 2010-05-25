if (typeof(morekomodo) == 'undefined') {
    var morekomodo = {};
}

if (typeof(morekomodo.hexDump) == 'undefined') {
    morekomodo.hexDump = {};
}

(function() {
    var bytesPerGroup = 8;
    var hexBytes = null;
    var asciiCodes = null;

    function initLookupTables() {
        if (!asciiCodes) {
            asciiCodes = [];
            hexBytes = []
            for (var i = 0; i < 256; i++) {
                hexBytes[i] = (i < 16 ? '0' : '') + i.toString(16).toUpperCase();
                asciiCodes[i] = String.fromCharCode(i);
            }
        }
    }

    function createLine(bytesArray, bytesPerRow, offset, textSep) {
        var hex = [];
        var txt = [];

        for (var r = 0; r < bytesPerRow; r++) {
            var ch = bytesArray[r + offset];

            hex.push(hexBytes[ch]);
            if (ch < 32 || ch >= 127) {
                txt.push('.');
            } else {
                txt.push(asciiCodes[ch]);
            }
            // add group separator
            if (((r + 1) % bytesPerGroup) == 0) {
                hex.push(' ');
            }
        }
        if (hex[hex.length - 1] == ' ') {
            hex.pop();
        }
        return hex.join(' ') + textSep + txt.join('');
    }

    this.dumpFile = function(filePath, bytesPerRow) {
        var file = Components.classes["@activestate.com/koFileEx;1"]
                .createInstance(Components.interfaces.koIFileEx)
        file.URI = filePath;
        file.open('rb');
        var count = {};
        arr = file.read(file.fileSize, count);
        file.close();

        return this.dumpArray(arr, bytesPerRow);
    }

    this.dumpArray = function(bytesArray, bytesPerRow) {
        initLookupTables();

        var textSep = '    ';
        var count = bytesArray.length;
        var hexContent = [];
        var offset = 0;
        var lineBytesCount = count < 256 ? 2 : 4;
        var lineContent;
        var lineNum;

        while (count > 0) {
            if (count < bytesPerRow) {
                var printedBytes = 1 + (bytesPerRow - count) * 3;
                var remainingGroups = (Math.ceil(bytesPerRow / bytesPerGroup) - Math.ceil(count / bytesPerGroup)) * 2;
                textSep = new Array(printedBytes + remainingGroups).join(' ') + textSep;
            }
            lineContent = createLine(bytesArray, Math.min(bytesPerRow, count), offset, textSep);
            lineNum = "";

            for (var i = 0, o = offset; i < lineBytesCount; i++) {
                lineNum = hexBytes[o & 0xFF] + lineNum;
                o >>= 8;
            }

            hexContent.push(lineNum + ': ' + lineContent);

            offset += bytesPerRow;
            count -= bytesPerRow;
        }
        return hexContent;
    }
}).apply(morekomodo.hexDump);
