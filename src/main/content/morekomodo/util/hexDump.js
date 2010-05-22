if (typeof(morekomodo) == 'undefined') {
    var morekomodo = {};
}

if (typeof(morekomodo.hexDump) == 'undefined') {
    morekomodo.hexDump = {};
}

(function() {
    var hexBytes = null;
    var asciiCodes = null;

    function getPadCount(len) {
        var c = 4;

        for (var i = 1; i <= len; i++) {
            if (c < len) {
                c <<= 1;
            }
        }

        return c;
    }

    function createLine(bytesArray, bytesPerRow, offset, textSep) {
        var hex = [];
        var txt = [];

        for (var r = offset; r < offset + bytesPerRow; r++) {
            var ch = bytesArray[r];

            hex.push(hexBytes[ch]);
            if (ch < 32 || ch >= 127) {
                txt.push('.');
            } else {
                txt.push(asciiCodes[ch]);
            }
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

    this.dumpArray = function(bytesArray, bytesPerRow) {
        initLookupTables();
        var n = bytesArray.length.toString(16).toUpperCase();
        var padZeroes = new Array(getPadCount(n.length) + 1).join('0');
        var textSep = '    ';

        var count = bytesArray.length;
        var hexContent = [];
        var offset = 0;

        while (count > 0) {
            if (count < bytesPerRow) {
                textSep = textSep + new Array(bytesPerRow - count + 1).join('   ');
            }
            var lineContent = createLine(bytesArray, Math.min(bytesPerRow, count), offset, textSep);
            var lineNum = offset.toString(16).toUpperCase();

            // pad line number
            for (var sp = padZeroes.length - lineNum.length; sp; sp--) {
                lineNum = '0' + lineNum;
            }

            hexContent.push(lineNum + ': ' + lineContent);

            offset += bytesPerRow;
            count -= bytesPerRow;
        }
        return hexContent;
    }
}).apply(morekomodo.hexDump);
