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
# Portions created by the Initial Developer are Copyright (C) 2009
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
var moreKomodoFindResultsUtil = {
    copyResultsToView : function(tabView,
                                 columnIds,
                                 removeDuplicates,
                                 useSelectedItems,
                                 separator) {
        var arr = this.getContentResults(tabView, columnIds,
                            removeDuplicates, useSelectedItems, separator);

        if (arr.length) {
            var findViewName = "FindResults.txt";
            var copyFunc = function(view) {
                var scimoz = view.scintilla.scimoz;

                // add an empty line
                arr.push("");
                scimoz.replaceSel(arr.join(getNewlineFromScimoz(scimoz)));
            };

            var updateFindResultView = function(view) {
                view.document.baseName = findViewName;
                view.parentView.updateLeafName(view);
                copyFunc(view);
            };

            var docViews = ko.views.manager.topView.getDocumentViews(true);
            var resultView = null;
            for (var i in docViews) {
                if (docViews[i].document.baseName == findViewName) {
                    resultView = docViews[i];
                    break;
                }
            }

            if (resultView) {
                copyFunc(resultView);
                resultView.makeCurrent();
            } else {
                // Since Komodo 5.0.3 doNewView is deprecated
                // http://www.openkomodo.com/blogs/toddw/komodo-5-0-3-api-changes
                if (typeof(ko.views.manager.doNewViewAsync) == "undefined") {
                    updateFindResultView(ko.views.manager.doNewView());
                } else {
                    ko.views.manager.doNewViewAsync("Text", null, updateFindResultView);
                }
            }
        }
    },

    /**
     * @param tabView tree view used to get elements
     * @param columnIds the tree columns id strings used to get text
     * @param removeDuplicates if true removes lines containing equal content
     * @param useSelectedItems if true returns only selected tree items
     * @param separator the string used to separate multiple fields (default TAB)
     */
    getContentResults : function(tabView,
                                 columnIds,
                                 removeDuplicates,
                                 useSelectedItems,
                                 separator) {
        function joinLine(index) {
            var line = [];
            for (var col = 0; col < columnIds.length; col++) {
                line.push(tabView.getCellText(index, {id : columnIds[col]}));
            }
            return line.join(separator);
        }

        if (typeof(separator) == "undefined" || separator == null) {
            separator = "\t";
        }

        var arr = [];
        if (removeDuplicates) {
            var uniqArr = [];
            if (useSelectedItems) {
                var selIndexes = this.getSelectedTreeIndexes(tabView);
                for (var i = 0; i < selIndexes.length; i++) {
                    uniqArr[joinLine(selIndexes[i])] = 1;
                }
            } else {
                for (var i = 0; i < tabView.rowCount; i++) {
                    uniqArr[joinLine(i)] = 1;
                }
            }
            for (var name in uniqArr) {
                arr.push(name);
            }
        } else {
            if (useSelectedItems) {
                var selIndexes = this.getSelectedTreeIndexes(tabView);
                for (var i = 0; i < selIndexes.length; i++) {
                    arr.push(joinLine(selIndexes[i]));
                }
            } else {
                for (var i = 0; i < tabView.rowCount; i++) {
                    arr.push(joinLine(i));
                }
            }
        }

        return arr;
    },

    getSelectedTreeIndexes : function(treeView) {
        var selection = treeView.selection;
        var items = [];

        for (var i = 0; i < selection.getRangeCount(); i++) {
            var minIdx = {};
            var maxIdx = {};
            selection.getRangeAt(i, minIdx, maxIdx);
            for (var selIdx = minIdx.value; selIdx <= maxIdx.value; selIdx++) {
                items.push(selIdx);
            }
        }

        return items;
    },

    /**
     * Open the custom format result dialog
     * @returns the string containing the result types packed
     * eg. "21" means CONTENT and FILE_PATH
     */
    openCustomFormatDialog : function() {
        var prefs = new MoreKomodoPrefs();
        var param = {isOk : false,
                     format : prefs.getString("results.last.used.custom.format", "")};

        window.openDialog("chrome://morekomodo/content/findResults/customFormatDialog.xul",
                          "_blank",
                          "chrome,modal,resizable=yes,dependent=yes",
                          param);
        if (param.isOk) {
            prefs.setString("results.last.used.custom.format", param.format);
            return param.format;
        }
        return null;
    }
}

MoreKomodoCommon.defineConstant(moreKomodoFindResultsUtil, "LINE_NUMBER", 0);
MoreKomodoCommon.defineConstant(moreKomodoFindResultsUtil, "FILE_PATH", 1);
MoreKomodoCommon.defineConstant(moreKomodoFindResultsUtil, "CONTENT", 2);
