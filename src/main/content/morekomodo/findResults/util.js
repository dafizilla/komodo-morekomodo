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
    koFindOptions : Components.classes["@activestate.com/koFindOptions;1"]
                        .createInstance(Components.interfaces.koIFindOptions),

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
    },

    /**
     * Open files obtaining file paths from tabView.
     * If useSelectedItems is false and the files count is greater that
     * minFileCount pref a dialog is shown from which user can choose files to open
     * @param tabView tree view used to get elements
     * @param columnId the tree file path column id
     * @param useSelectedItems if true returns only selected tree items
     */
    openFiles : function(tabView, columnId, useSelectedItems) {
        var files = moreKomodoFindResultsUtil.getContentResults(
                            tabView, [columnId], true, useSelectedItems);
        var filesToOpen = null;
        var locMsg = MoreKomodoCommon.getLocalizedMessage;
        var locFmtMsg = MoreKomodoCommon.getFormattedMessage;
        if (useSelectedItems) {
            filesToOpen = files;
        } else {
            if (files.length) {
                var prefs = new MoreKomodoPrefs();
                if (files.length > prefs.readOpenFoundFileInfo().minFileCount) {
                    filesToOpen = ko.dialogs.selectFromList(
                            locMsg("findresults.openfoundfiles.select.title"),
                            locFmtMsg("findresults.openfoundfiles.select.text", [files.length]),
                            files,
                            "zero-or-more",
                            null,
                            null,
                            false,
                            null);
                } else {
                    filesToOpen = files;
                }
            }
        }
        if (filesToOpen) {
            var response = "Yes";
            if (filesToOpen.length > 10) {
                response = ko.dialogs.yesNo(
                    locFmtMsg("findresults.openfoundfiles.confirm.text", [filesToOpen.length]),
                                 null,
                                 null,
                                 locMsg("findresults.openfoundfiles.confirm.title"),
                                 null);
            }
            if (response == "Yes") {
                for (var i = 0; i < filesToOpen.length; i++) {
                    // Using ko.views.manager.doFileOpen the document isn't shared
                    // among multiple windows so the ko.open package is used
                    ko.open.URI(filesToOpen[i]);
                }
            }
        }
    },

    createLabelFromFindInfo : function(findInfo) {
        var arr = findInfo.pattern.split(/\r|\r\n|\n/g);
        var label = arr[0];

        if (label.length == 0) {
            return "";
        }

        // Add a paragraph character if pattern is 'multiple line'
        if (arr.length > 1) {
            label += String.fromCharCode(182);
        }

        this.copyFindOptions(findInfo.options, this.koFindOptions);

        return this.koFindOptions.searchDescFromPattern(label);
    },

    /**
     * Copy koFindOptions from an object to another
     * @param from koFindOptions to copy
     * @param to koFindOptions destination
     */
    copyFindOptions : function(from, to) {
        to.patternType = from.patternType;
        to.matchWord = from.matchWord;
        to.caseSensitivity = from.caseSensitivity;
        to.displayInFindResults2 = from.displayInFindResults2;
        to.multiline = from.multiline;
        to.cwd = from.cwd;
        to.encodedFolders = from.encodedFolders;
        to.searchInSubfolders = from.searchInSubfolders;
        to.encodedIncludeFiletypes = from.encodedIncludeFiletypes;
        to.encodedExcludeFiletypes = from.encodedExcludeFiletypes;

        //attribute boolean searchBackward;
        //attribute long preferredContextType;
        //attribute boolean showReplaceAllResults;
        //attribute boolean confirmReplacementsInFiles;
    }
}

MoreKomodoCommon.defineConstant(moreKomodoFindResultsUtil, "LINE_NUMBER", 0);
MoreKomodoCommon.defineConstant(moreKomodoFindResultsUtil, "FILE_PATH", 1);
MoreKomodoCommon.defineConstant(moreKomodoFindResultsUtil, "CONTENT", 2);
