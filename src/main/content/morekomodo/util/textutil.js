/*
# ***** BEGIN LICENSE BLOCK *****
# Version: MPL 1.1/GPL 2.0/LGPL 2.1
#
# The contents of this file are subject to the Mozilla Public License Version
# 1.1 (the "License"); you may not use this file except in compliance with
# the License. You may obtain a copy of the License at
# http://www.mozilla.org/MPL/
#
# Software distributed under the License is distributed on an "AS IS" basis,
# WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
# for the specific language governing rights and limitations under the
# License.
#
# The Initial Developer of the Original Code is
# Davide Ficano.
# Portions created by the Initial Developer are Copyright (C) 2007
# the Initial Developer. All Rights Reserved.
#
# Contributor(s):
#   Davide Ficano <davide.ficano@gmail.com>
#
# Alternatively, the contents of this file may be used under the terms of
# either the GNU General Public License Version 2 or later (the "GPL"), or
# the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
# in which case the provisions of the GPL or the LGPL are applicable instead
# of those above. If you wish to allow use of your version of this file only
# under the terms of either the GPL or the LGPL, and not to allow others to
# use your version of this file under the terms of the MPL, indicate your
# decision by deleting the provisions above and replace them with the notice
# and other provisions required by the GPL or the LGPL. If you do not delete
# the provisions above, a recipient may use your version of this file under
# the terms of any one of the MPL, the GPL or the LGPL.
#
# ***** END LICENSE BLOCK *****
*/
var eolText = [];
eolText[Components.interfaces.koIDocument.EOL_CR] = '\r';
eolText[Components.interfaces.koIDocument.EOL_CRLF] = '\r\n';
eolText[Components.interfaces.koIDocument.EOL_LF] = '\n';

var gHtmlEntities = [];
gHtmlEntities["&amp;"] = 38; gHtmlEntities["&gt;"] = 62; gHtmlEntities["&lt;"] = 60;
gHtmlEntities["&quot;"] = 34; gHtmlEntities["&apos;"] = 39;

gHtmlEntities["&acute;"] = 180;    gHtmlEntities["&cedil;"] = 184;    gHtmlEntities["&circ;"] = 710;
gHtmlEntities["&macr;"] = 175;     gHtmlEntities["&middot;"] = 183;   gHtmlEntities["&tilde;"] = 732;
gHtmlEntities["&uml;"] = 168;      gHtmlEntities["&Aacute;"] = 193;   gHtmlEntities["&aacute;"] = 225;
gHtmlEntities["&Acirc;"] = 194;    gHtmlEntities["&acirc;"] = 226;    gHtmlEntities["&AElig;"] = 198;
gHtmlEntities["&aelig;"] = 230;    gHtmlEntities["&Agrave;"] = 192;   gHtmlEntities["&agrave;"] = 224;
gHtmlEntities["&Aring;"] = 197;    gHtmlEntities["&aring;"] = 229;    gHtmlEntities["&Atilde;"] = 195;
gHtmlEntities["&atilde;"] = 227;   gHtmlEntities["&Auml;"] = 196;     gHtmlEntities["&auml;"] = 228;
gHtmlEntities["&Ccedil;"] = 199;   gHtmlEntities["&ccedil;"] = 231;   gHtmlEntities["&Eacute;"] = 201;
gHtmlEntities["&eacute;"] = 233;   gHtmlEntities["&Ecirc;"] = 202;    gHtmlEntities["&ecirc;"] = 234;
gHtmlEntities["&Egrave;"] = 200;   gHtmlEntities["&egrave;"] = 232;   gHtmlEntities["&ETH;"] = 208;
gHtmlEntities["&eth;"] = 240;      gHtmlEntities["&Euml;"] = 203;     gHtmlEntities["&euml;"] = 235;
gHtmlEntities["&Iacute;"] = 205;   gHtmlEntities["&iacute;"] = 237;   gHtmlEntities["&Icirc;"] = 206;
gHtmlEntities["&icirc;"] = 238;    gHtmlEntities["&Igrave;"] = 204;   gHtmlEntities["&igrave;"] = 236;
gHtmlEntities["&Iuml;"] = 207;     gHtmlEntities["&iuml;"] = 239;     gHtmlEntities["&Ntilde;"] = 209;
gHtmlEntities["&ntilde;"] = 241;   gHtmlEntities["&Oacute;"] = 211;   gHtmlEntities["&oacute;"] = 243;
gHtmlEntities["&Ocirc;"] = 212;    gHtmlEntities["&ocirc;"] = 244;    gHtmlEntities["&OElig;"] = 338;
gHtmlEntities["&oelig;"] = 339;    gHtmlEntities["&Ograve;"] = 210;   gHtmlEntities["&ograve;"] = 242;
gHtmlEntities["&Oslash;"] = 216;   gHtmlEntities["&oslash;"] = 248;   gHtmlEntities["&Otilde;"] = 213;
gHtmlEntities["&otilde;"] = 245;   gHtmlEntities["&Ouml;"] = 214;     gHtmlEntities["&ouml;"] = 246;
gHtmlEntities["&Scaron;"] = 352;   gHtmlEntities["&scaron;"] = 353;   gHtmlEntities["&szlig;"] = 223;
gHtmlEntities["&THORN;"] = 222;    gHtmlEntities["&thorn;"] = 254;    gHtmlEntities["&Uacute;"] = 218;
gHtmlEntities["&uacute;"] = 250;   gHtmlEntities["&Ucirc;"] = 219;    gHtmlEntities["&ucirc;"] = 251;
gHtmlEntities["&Ugrave;"] = 217;   gHtmlEntities["&ugrave;"] = 249;   gHtmlEntities["&Uuml;"] = 220;
gHtmlEntities["&uuml;"] = 252;     gHtmlEntities["&Yacute;"] = 221;   gHtmlEntities["&yacute;"] = 253;
gHtmlEntities["&yuml;"] = 255;     gHtmlEntities["&Yuml;"] = 376;

gHtmlEntities["&cent;"] = 162;     gHtmlEntities["&curren;"] = 164;   gHtmlEntities["&euro;"] = 8364;
gHtmlEntities["&pound;"] = 163;    gHtmlEntities["&yen;"] = 165;      gHtmlEntities["&brvbar;"] = 166;
gHtmlEntities["&bull;"] = 8226;    gHtmlEntities["&copy;"] = 169;     gHtmlEntities["&dagger;"] = 8224;
gHtmlEntities["&Dagger;"] = 8225;  gHtmlEntities["&frasl;"] = 8260;   gHtmlEntities["&hellip;"] = 8230;
gHtmlEntities["&iexcl;"] = 161;    gHtmlEntities["&image;"] = 8465;   gHtmlEntities["&iquest;"] = 191;
gHtmlEntities["&lrm;"] = 8206;     gHtmlEntities["&mdash;"] = 8212;   gHtmlEntities["&ndash;"] = 8211;
gHtmlEntities["&not;"] = 172;      gHtmlEntities["&oline;"] = 8254;   gHtmlEntities["&ordf;"] = 170;
gHtmlEntities["&ordm;"] = 186;     gHtmlEntities["&para;"] = 182;     gHtmlEntities["&permil;"] = 8240;
gHtmlEntities["&prime;"] = 8242;   gHtmlEntities["&Prime;"] = 8243;   gHtmlEntities["&real;"] = 8476;
gHtmlEntities["&reg;"] = 174;      gHtmlEntities["&rlm;"] = 8207;     gHtmlEntities["&sect;"] = 167;
gHtmlEntities["&shy;"] = 173;      gHtmlEntities["&sup1;"] = 185;     gHtmlEntities["&trade;"] = 8482;
gHtmlEntities["&weierp;"] = 8472;  gHtmlEntities["&bdquo;"] = 8222;   gHtmlEntities["&laquo;"] = 171;
gHtmlEntities["&ldquo;"] = 8220;   gHtmlEntities["&lsaquo;"] = 8249;  gHtmlEntities["&lsquo;"] = 8216;
gHtmlEntities["&raquo;"] = 187;    gHtmlEntities["&rdquo;"] = 8221;   gHtmlEntities["&rsaquo;"] = 8250;
gHtmlEntities["&rsquo;"] = 8217;   gHtmlEntities["&sbquo;"] = 8218;

gHtmlEntities["&deg;"] = 176;      gHtmlEntities["&divide;"] = 247;   gHtmlEntities["&frac12;"] = 189;
gHtmlEntities["&frac14;"] = 188;   gHtmlEntities["&frac34;"] = 190;   gHtmlEntities["&ge;"] = 8805;
gHtmlEntities["&le;"] = 8804;      gHtmlEntities["&minus;"] = 8722;   gHtmlEntities["&sup2;"] = 178;
gHtmlEntities["&sup3;"] = 179;     gHtmlEntities["&times;"] = 215;    gHtmlEntities["&alefsym;"] = 8501;
gHtmlEntities["&and;"] = 8743;     gHtmlEntities["&ang;"] = 8736;     gHtmlEntities["&asymp;"] = 8776;
gHtmlEntities["&cap;"] = 8745;     gHtmlEntities["&cong;"] = 8773;    gHtmlEntities["&cup;"] = 8746;
gHtmlEntities["&empty;"] = 8709;   gHtmlEntities["&equiv;"] = 8801;   gHtmlEntities["&exist;"] = 8707;
gHtmlEntities["&fnof;"] = 402;     gHtmlEntities["&forall;"] = 8704;  gHtmlEntities["&infin;"] = 8734;
gHtmlEntities["&int;"] = 8747;     gHtmlEntities["&isin;"] = 8712;    gHtmlEntities["&lang;"] = 9001;
gHtmlEntities["&lceil;"] = 8968;   gHtmlEntities["&lfloor;"] = 8970;  gHtmlEntities["&lowast;"] = 8727;
gHtmlEntities["&micro;"] = 181;    gHtmlEntities["&nabla;"] = 8711;   gHtmlEntities["&ne;"] = 8800;
gHtmlEntities["&ni;"] = 8715;      gHtmlEntities["&notin;"] = 8713;   gHtmlEntities["&nsub;"] = 8836;
gHtmlEntities["&oplus;"] = 8853;   gHtmlEntities["&or;"] = 8744;      gHtmlEntities["&otimes;"] = 8855;
gHtmlEntities["&part;"] = 8706;    gHtmlEntities["&perp;"] = 8869;    gHtmlEntities["&plusmn;"] = 177;
gHtmlEntities["&prod;"] = 8719;    gHtmlEntities["&prop;"] = 8733;    gHtmlEntities["&radic;"] = 8730;
gHtmlEntities["&rang;"] = 9002;    gHtmlEntities["&rceil;"] = 8969;   gHtmlEntities["&rfloor;"] = 8971;
gHtmlEntities["&sdot;"] = 8901;    gHtmlEntities["&sim;"] = 8764;     gHtmlEntities["&sub;"] = 8834;
gHtmlEntities["&sube;"] = 8838;    gHtmlEntities["&sum;"] = 8721;     gHtmlEntities["&sup;"] = 8835;
gHtmlEntities["&supe;"] = 8839;    gHtmlEntities["&there4;"] = 8756;  gHtmlEntities["&Alpha;"] = 913;
gHtmlEntities["&alpha;"] = 945;    gHtmlEntities["&Beta;"] = 914;     gHtmlEntities["&beta;"] = 946;
gHtmlEntities["&Chi;"] = 935;      gHtmlEntities["&chi;"] = 967;      gHtmlEntities["&Delta;"] = 916;
gHtmlEntities["&delta;"] = 948;    gHtmlEntities["&Epsilon;"] = 917;  gHtmlEntities["&epsilon;"] = 949;
gHtmlEntities["&Eta;"] = 919;      gHtmlEntities["&eta;"] = 951;      gHtmlEntities["&Gamma;"] = 915;
gHtmlEntities["&gamma;"] = 947;    gHtmlEntities["&Iota;"] = 921;     gHtmlEntities["&iota;"] = 953;
gHtmlEntities["&Kappa;"] = 922;    gHtmlEntities["&kappa;"] = 954;    gHtmlEntities["&Lambda;"] = 923;
gHtmlEntities["&lambda;"] = 955;   gHtmlEntities["&Mu;"] = 924;       gHtmlEntities["&mu;"] = 956;
gHtmlEntities["&Nu;"] = 925;       gHtmlEntities["&nu;"] = 957;       gHtmlEntities["&Omega;"] = 937;
gHtmlEntities["&omega;"] = 969;    gHtmlEntities["&Omicron;"] = 927;  gHtmlEntities["&omicron;"] = 959;
gHtmlEntities["&Phi;"] = 934;      gHtmlEntities["&phi;"] = 966;      gHtmlEntities["&Pi;"] = 928;
gHtmlEntities["&pi;"] = 960;       gHtmlEntities["&piv;"] = 982;      gHtmlEntities["&Psi;"] = 936;
gHtmlEntities["&psi;"] = 968;      gHtmlEntities["&Rho;"] = 929;      gHtmlEntities["&rho;"] = 961;
gHtmlEntities["&Sigma;"] = 931;    gHtmlEntities["&sigma;"] = 963;    gHtmlEntities["&sigmaf;"] = 962;
gHtmlEntities["&Tau;"] = 932;      gHtmlEntities["&tau;"] = 964;      gHtmlEntities["&Theta;"] = 920;
gHtmlEntities["&theta;"] = 952;    gHtmlEntities["&thetasym;"] = 977; gHtmlEntities["&upish;"] = 978;
gHtmlEntities["&Upsilon;"] = 933;  gHtmlEntities["&upsilon;"] = 965;  gHtmlEntities["&Xi;"] = 926;
gHtmlEntities["&xi;"] = 958;       gHtmlEntities["&Zeta;"] = 918;     gHtmlEntities["&zeta;"] = 950;

gHtmlEntities["&crarr;"] = 8629;   gHtmlEntities["&darr;"] = 8595;    gHtmlEntities["&dArr;"] = 8659;
gHtmlEntities["&harr;"] = 8596;    gHtmlEntities["&hArr;"] = 8660;    gHtmlEntities["&larr;"] = 8592;
gHtmlEntities["&lArr;"] = 8656;    gHtmlEntities["&rarr;"] = 8594;    gHtmlEntities["&rArr;"] = 8658;
gHtmlEntities["&uarr;"] = 8593;    gHtmlEntities["&uArr;"] = 8657;    gHtmlEntities["&clubs;"] = 9827;
gHtmlEntities["&diams;"] = 9830;   gHtmlEntities["&hearts;"] = 9829;  gHtmlEntities["&spades;"] = 9824;
gHtmlEntities["&loz;"] = 9674;     gHtmlEntities["&ensp;"] = 8194;    gHtmlEntities["&emsp;"] = 8195;
gHtmlEntities["&thinsp;"] = 8201;  gHtmlEntities["&nbsp;"] = 160;

var gHtmlCodes = flipArray(gHtmlEntities);

function htmlDecode(str) {
    var re = /&[a-z]*;|&#[0-9]*;/gi;
    return str.replace(re, htmlDecodeCallback);
}

function htmlDecodeCallback(str) {
    if (str[1] == "#") {
        var chCode = parseInt(str.substring(2));
        return String.fromCharCode(chCode);
    } else {
        var chCode = gHtmlEntities[str];
        if (chCode) {
        return String.fromCharCode(chCode);
        }
    }
    return str;
}

function htmlEncode(str, useNumeric) {
    var res = "";

    for (var i = 0; i < str.length; i++) {
        var ch = str.charCodeAt(i);
        var entity = gHtmlCodes[ch];

        if (entity) {
            if (useNumeric) {
                res += "&#" + ch + ";";
            } else {
                res += entity;
            }
        } else if (ch > 127) {
            res += "&#" + ch + ";";
        } else {
            res += str[i];
        }
    }

    return res;
}

function capitalizeText(str) {
    var re = /[0-9A-Za-z]*/g;
    return str.replace(re,
        function(str) {
            return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
        });
}

function applyConversionToSelection(view, fn, selectText) {
    var sel = view.selection;

    if (sel.length) {
        var scimoz = view.scintilla.scimoz;
        var prevStartPos = scimoz.selectionStart;
        var prevEndPos = scimoz.selectionEnd;
        var selectionMode = scimoz.selectionMode;

        if (selectionMode == scimoz.SC_SEL_RECTANGLE) {
            var convertedLines = [];
            var lineStart = scimoz.lineFromPosition(prevStartPos);
            var lineEnd = scimoz.lineFromPosition(prevEndPos);
            for (var i = lineStart; i <= lineEnd; i++) {
                var lineInfo = {
                        startPos : scimoz.getLineSelStartPosition(i),
                        endPos : scimoz.getLineSelEndPosition(i)
                };

                lineInfo.str = fn(scimoz.getTextRange(lineInfo.startPos, lineInfo.endPos));
                convertedLines.push(lineInfo);
            }

            // Lines are converted starting from last otherwise values change
            // and positions became invalid
            for (var i = convertedLines.length - 1; i >= 0; i--) {
                var lineInfo = convertedLines[i];

                var endPos = lineInfo.startPos + lineInfo.str.length;
                if (endPos > lineInfo.endPos) {
                    endPos = lineInfo.endPos;
                }

                scimoz.targetStart = lineInfo.startPos;
                scimoz.targetEnd = endPos;
                scimoz.replaceTarget(-1, lineInfo.str);

                // if necessary delete exceeding characters
                // i.e. original string occupies more space then converted
                var originalLen = lineInfo.endPos - lineInfo.startPos;
                if (originalLen > lineInfo.str.length) {
                    scimoz.targetStart = endPos;
                    scimoz.targetEnd = lineInfo.endPos;
                    scimoz.replaceTarget(0, "");
                }
            }
        } else {
            var str = fn(sel);
            scimoz.replaceSel(str);

            // restore selection
            if (selectText) {
                scimoz.selectionStart = prevStartPos;
                scimoz.selectionEnd = prevStartPos + str.length;
            }
        }
    }
}

function dos2unixPathSepatators(str) {
    return str.replace(/\\/g, "/");
}

function doubleDosSeparators(str) {
    return str.replace(/\\/g, "\\\\");
}

function stripDoubleDosSeparators(str) {
    return str.replace(/\\\\/g, "\\");
}

function sortView(view, sortOptions) {
    var scimoz = view.scintilla.scimoz;
    var useSelection = sortOptions.sortOnlySelection;

    var firstLine, lastLine;
    if (useSelection) {
        var selStartPos = scimoz.selectionStart;
        var selEndPos = scimoz.selectionEnd;

        firstLine = scimoz.lineFromPosition(selStartPos);
        lastLine = scimoz.lineFromPosition(selEndPos);

        var firstColumnPos = scimoz.positionFromLine(lastLine);
        // if selection ends before first column means the line isn't involved
        if (firstColumnPos == selEndPos) {
            --lastLine;
        }
    } else {
        firstLine = 0;
        lastLine = scimoz.lineCount - 1;
    }

    if (firstLine == lastLine) {
        return;
    }

    var lines = [];
    for (var i = firstLine; i <= lastLine; i++) {
        var startPos = scimoz.positionFromLine(i);
        var endPos = scimoz.getLineEndPosition(i);

        lines.push(scimoz.getTextRange(startPos, endPos));
    }

    var s = getSortedBuffer(lines, sortOptions,
                            eolText[view.document.new_line_endings]);

    if (useSelection) {
        scimoz.selectionStart = scimoz.positionFromLine(firstLine);
        scimoz.selectionEnd = scimoz.getLineEndPosition(lastLine);
    } else {
        scimoz.selectAll();
    }
    scimoz.replaceSel(s);
}

function SortOptions() {
    this.removeDuplicate = false;
    this.ignoreCase = true;
    this.ascending = true;
    this.numeric = false;
    this.sortOnlySelection = false;
}

function getSortedBuffer(arr, sortOptions, nl) {
    var ltValue = sortOptions.ascending ? -1 : 1;
    var gtValue = sortOptions.ascending ? 1 : -1;

    function sortFn(a, b) {
        var sa = a;
        var sb = b;

        if (sortOptions.ignoreCase) {
            sa = a.toLowerCase();
            sb = b.toLowerCase();
        }
        if (sortOptions.numeric) {
            var na = parseFloat(sa);
            var nb = parseFloat(sb);

            if (!isNaN(na) && !isNaN(nb)) {
                sa = na;
                sb = nb;
            }
        }
        if (sa == sb) {
            return 0;
        }
        return sa < sb ? ltValue : gtValue;
    }
    arr.sort(sortFn);

    var s = "";
    if (sortOptions.removeDuplicate) {
        var prevLine = null;
        for (var i = 0; i < arr.length; i++) {
            var lineData = arr[i];

            if (prevLine != lineData) {
                s += lineData + nl;
                prevLine = lineData;
            }
        }
        // remove last newline
        s = s.substring(0, s.length - nl.length);
    } else {
        s = arr.join(nl);
    }

    return s;
}

/**
 * Return caret position.
 * CaretPosition contains startPos, endPos, firstVisibileLine
 */
function getCaretPosition(view) {
    var scimoz = view.scintilla.scimoz;
    var caretPosition = {
        firstVisibileLine : scimoz.firstVisibleLine,
        startPos : null,
        endPos : null
    };

    if (view.selection.length != 0) {
        caretPosition.startPos = scimoz.selectionStart;
        caretPosition.endPos = scimoz.selectionEnd;
    } else {
        caretPosition.startPos = scimoz.currentPos;
        caretPosition.endPos = caretPosition.startPos;
    }

    return caretPosition;
}

function moveCaret(view, caretPosition) {
    var scimoz = view.scintilla.scimoz;

    scimoz.gotoLine(caretPosition.firstVisibleLine);
    scimoz.setSel(caretPosition.startPos, caretPosition.endPos);
}

function getSelection(view) {
    var sel = view.selection;
    var selArr = [];

    if (sel.length) {
        var scimoz = view.scintilla.scimoz;
        var selectionMode = scimoz.selectionMode;
        var lineStart = scimoz.lineFromPosition(scimoz.selectionStart);
        var lineEnd = scimoz.lineFromPosition(scimoz.selectionEnd);

        if (selectionMode == scimoz.SC_SEL_RECTANGLE) {
            for (var i = lineStart; i <= lineEnd; i++) {
                var selectionStart = scimoz.getLineSelStartPosition(i);
                var selectionEnd = scimoz.getLineSelEndPosition(i);
                selArr.push(scimoz.getTextRange(selectionStart, selectionEnd));
            }
        } else {
            var selectionStart = scimoz.getLineSelStartPosition(lineStart);
            var selectionEnd = scimoz.getLineSelEndPosition(lineEnd);
            selArr.push(scimoz.getTextRange(selectionStart, selectionEnd));
        }
    }
    return selArr.join(eolText[view.document.new_line_endings]);
}

/**
 * Exchanges all keys with their associated values in an array
 */
function flipArray(array) {
    var newArr = [];

    for (var i in array) {
        newArr[array[i]] = i;
    }

    return newArr;
}

function convertGlobMetaCharsToRegexpMetaChars(glob) {
    var re = glob;
    re = re.replace(/([.^$+(){}\[\]\\|])/g, "\\$1");
    re = re.replace(/\?/g, "(.|[\r\n])");
    re = re.replace(/\*/g, "(.|[\r\n])*");
    return re;
}

function getNewlineFromScimoz(scimoz) {
    switch (scimoz.eOLMode) {
        case Components.interfaces.ISciMoz.SC_EOL_LF:
            return '\n';
        case Components.interfaces.ISciMoz.SC_EOL_CRLF:
            return '\r\n';
        case Components.interfaces.ISciMoz.SC_EOL_CR:
            return '\r';
        default:
            return '\n';
    }
}

function getCurrentLine(view) {
    var scimoz = view.scintilla.scimoz;
    var lineStart = scimoz.lineFromPosition(scimoz.currentPos);
    var lineStartPos = scimoz.positionFromLine(lineStart);
    var nextLineStartPos = scimoz.positionFromLine(lineStart + 1);

    if (scimoz.getLineEndPosition(lineStart) == nextLineStartPos) {
        // At last line of doc, buffer doesn't end with an EOL
        var line = scimoz.getTextRange(lineStartPos, nextLineStartPos);
        var eol = eolText[view.document.new_line_endings];
        return line + eol;
    } else {
        return scimoz.getTextRange(lineStartPos, nextLineStartPos);
    }
    return "";
}