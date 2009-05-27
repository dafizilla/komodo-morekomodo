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
var charNameAtom = Components.classes["@mozilla.org/atom-service;1"]
            .getService(Components.interfaces.nsIAtomService)
            .getAtom("charName");

function UnicodeTableTreeView() {
    this.items = [];
    this.treebox = null;

    this.latinCodes =[
        {code : 0, name : "NUL", ctrl : "^@"},
        {code : 1, name : "SOH", ctrl : "^A"},
        {code : 2, name : "STX", ctrl : "^B"},
        {code : 3, name : "ETX", ctrl : "^C"},
        {code : 4, name : "EOT", ctrl : "^D"},
        {code : 5, name : "ENQ", ctrl : "^E"},
        {code : 6, name : "ACK", ctrl : "^F"},
        {code : 7, name : "BEL", ctrl : "^G\\a"},
        {code : 8, name : "BS", ctrl : "^H\\b"},
        {code : 9, name : "HT", ctrl : "^I\\t"},
        {code : 10, name : "LF", ctrl : "^J\\n"},
        {code : 11, name : "VT", ctrl : "^K\\v"},
        {code : 12, name : "FF", ctrl : "^L\\f"},
        {code : 13, name : "CR", ctrl : "^M\\r"},
        {code : 14, name : "SO", ctrl : "^N"},
        {code : 15, name : "SI", ctrl : "^O"},
        {code : 16, name : "DLE", ctrl : "^P"},
        {code : 17, name : "DC1", ctrl : "^Q"},
        {code : 18, name : "DC2", ctrl : "^R"},
        {code : 19, name : "DC3", ctrl : "^S"},
        {code : 20, name : "DC4", ctrl : "^T"},
        {code : 21, name : "NAK", ctrl : "^U"},
        {code : 22, name : "SYN", ctrl : "^V"},
        {code : 23, name : "ETB", ctrl : "^W"},
        {code : 24, name : "CAN", ctrl : "^X"},
        {code : 25, name : "EM", ctrl : "^Y"},
        {code : 26, name : "SUB", ctrl : "^Z"},
        {code : 27, name : "ESC", ctrl : "^[\\e"},
        {code : 28, name : "FS", ctrl : "^\\"},
        {code : 29, name : "GS", ctrl : "^]"},
        {code : 30, name : "RS", ctrl : "^^"},
        {code : 31, name : "US", ctrl : "^_"}
    ];
    
    for (var c = 0x20; c < 0xA0; c++) {
        this.latinCodes[c] = {code : c,
                    name : c == 0x20 ? "SPC" : c == 0x7F ? "DEL" : String.fromCharCode(c),
                    ctrl : c == 0x7F ? "^?" : ""};
    }

    this.latinSupplementCodes = [];
    for (var c = 0; c < 0x100 - 0xA0; c++) {
        this.latinSupplementCodes[c] = {code : c + 0xA0,
                    name : String.fromCharCode(c + 0xA0),
                    ctrl : ""};
    }
    
    this.items = this.createTableSet(0, 0x7F);
    
}

UnicodeTableTreeView.prototype = {
    createTableSet : function(from, to) {
        if (from > to) {
            var temp = from;
            from = to;
            to = temp;
        }

        var charInfoArr;
        // Basic latin and Latin-1 Supplement can have named codes
        // so are handled in special manner
        if (to < 0x80) {
            charInfoArr = this.latinCodes;
        } else if (to < 0x100) {
            charInfoArr = this.latinSupplementCodes;
        } else {
            charInfoArr = [];
            for (var i = 0; i <= (to - from); i++) {
                charInfoArr[i] = {code : from + i,
                        name : String.fromCharCode(from + i),
                        ctrl : ""};
            }
        }

        var arr = [];
        for (var i = 0; i < charInfoArr.length; i++) {
            var charInfo = charInfoArr[i];
            var item = {};
    
            item.charCode = String.fromCharCode(charInfo.code);
            item["dec-treecol"] = sprintf("%6d", charInfo.code);
            item["hex-treecol"] = sprintf("%04X", charInfo.code);
            item["oct-treecol"] = sprintf("%06o", charInfo.code);
            item["char-treecol"] = charInfo.name;
            item["ctrl-char-treecol"] = charInfo.ctrl;
    
            arr.push(item);
        }
        
        return arr;
    },
    
    setRange : function(from, to) {
        var arr = this.createTableSet(from, to);
        this.treebox.rowCountChanged(0, arr.length - this.items.length);
        this.items = arr;
        this.refresh();
    },
    
    get selectedItem() {
        var selIdx = this.selection.currentIndex;
        
        if (selIdx < 0) {
            return null;
        }
        return this.items[selIdx];
    },
        
    refresh : function() {
        this.selection.clearSelection();
        this.selection.select(0);
        this.treebox.invalidate();
        this.treebox.ensureRowIsVisible(0);
    },

    getCellText : function(row, column){
        return this.items[row][column.id || column];
    },

    get rowCount() {
        return this.items.length;
    },

    cycleCell: function(row, column) {},

    getImageSrc: function (row, column) {
        return null;
    },

    setTree: function(treebox){
        this.treebox = treebox;
    },

    getCellProperties: function(row, column, props) {
        switch (column.id || column) {
            case "char-treecol":
                props.AppendElement(charNameAtom);
        }
    },

    cycleHeader: function(col, elem) {},
    isContainer: function(row){ return false; },
    isSeparator: function(row){ return false; },
    isSorted: function(row){ return false; },
    getLevel: function(row){ return 0; },
    getRowProperties: function(row,props){},
    getColumnProperties: function(colid,col,props){}
};
