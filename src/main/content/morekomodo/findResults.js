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
var moreKomodoFindResults = {
    init : function() {
        for (var i = 1; i <= 2; i++) {
            var stopButton = document.getElementById("findresults" + i + "-stopsearch-button");

            if (stopButton) {
                stopButton.addEventListener("DOMAttrModified",
                            moreKomodoFindResults.handleRefreshStatus,
                            false);
            }
        }
        this.arrFind = [];
        this.findStartedFromUI = true;
        // Contains the last options set into Find dialog
        this.lastUsedFindOptions = {};

        this._findSvc = Components.classes["@activestate.com/koFindService;1"].
               getService(Components.interfaces.koIFindService);
        this._koOptions = Components.classes["@activestate.com/koFindOptions;1"]
                    .createInstance(Components.interfaces.koIFindOptions);

        this._tooltipOptions = [
            { id: "morekomodo-refresh-include", property : "encodedIncludeFiletypes"},
            { id: "morekomodo-refresh-exclude", property : "encodedExcludeFiletypes"},
            { id: "morekomodo-refresh-folders", property : "encodedFolders"}
            ];
     },

    onCopyFindResults : function(tabIndex, copyFileNames) {
        var arr = this.getLinesFromFindResults(tabIndex, copyFileNames);

        if (arr.length) {
            var msg;

            if (copyFileNames) {
                msg = MoreKomodoCommon
                    .getFormattedMessage("findresults.copy.filenames", [arr.length]);
            } else {
                var msg = MoreKomodoCommon
                    .getFormattedMessage("findresults.copy.contents", [arr.length]);
            }

            // Is \n multi-platform compliant?
            MoreKomodoCommon.copyToClipboard(arr.join("\n"));
            ko.statusBar.AddMessage(msg, "moreKomodo", 3000, true)
        }
    },

    onRefreshFindResults : function(tabIndex) {
        this.onRepeatFind(tabIndex, this.arrFind.length - 1);
    },

    onRepeatFind : function(tabIndex, findIndex) {
        this.findStartedFromUI = false;
        var findInfo = this.removeIndex(this.arrFind, findIndex);
        this.executeFind(tabIndex, findInfo.options, findInfo.context, findInfo.pattern);
    },

    handleRefreshStatus : function(event) {
        if (event.attrName == "disabled") {
            if (event.newValue == "true") { // attribute is set
                moreKomodoFindResults.onFindFinished(event);
            }
            if (event.newValue == "" && event.prevValue != "") { // attribute is removed
                moreKomodoFindResults.onFindStarted(event);
            }
        }
    },

    onFindStarted : function(event) {
        var idName = event.target.id.replace("-stopsearch-button", "-morekomodo-refresh");
        var refreshButton = document.getElementById(idName);

        if (refreshButton) {
            refreshButton.setAttribute("disabled", "true");
            moreKomodoFindResults.updateFindInfo(event.target);

            if (this.findStartedFromUI) {
                this.copyOptions(this._findSvc.options, this.lastUsedFindOptions);
            } else {
                this.findStartedFromUI = true;
            }
        }
    },

    onFindFinished : function(event) {
        var idName = event.target.id.replace("-stopsearch-button", "-morekomodo-refresh");
        var refreshButton = document.getElementById(idName);

        if (refreshButton) {
            refreshButton.removeAttribute("disabled");

            // restore to last used settings so find dialog shows them correctly
            // timeOut ensures the description is updated before restoring settings
            window.setTimeout(function() {
                moreKomodoFindResults.copyOptions(
                    moreKomodoFindResults.lastUsedFindOptions,
                    moreKomodoFindResults._findSvc.options);
                }, 400);
        }
    },

    updateFindInfo : function(target) {
        var tabIndex = target.id.match("([0-9]+)");

        if (tabIndex.length > 0) {
            var tab = FindResultsTab_GetManager(tabIndex[1]);

            var findInfo = {
                    options : {},
                    context: tab.context_,
                    pattern : tab._pattern
                    };
            this.copyOptions(this._findSvc.options, findInfo.options);
            this.pushItem(this.arrFind, findInfo,
                new MoreKomodoPrefs().readMaxRefreshHistoryEntries());
        } else {
            MoreKomodoCommon.log("Unable to find tabIndex for id " + target.id);
        }
    },

    copyOptions : function(from, to) {
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
    },

    onOpenFoundFiles : function(tabIndex) {
        var tab = FindResultsTab_GetManager(tabIndex);

        var files = this.getUniqFileNames(tab.view, tabIndex);
        var filesToOpen = null;
        var locMsg = MoreKomodoCommon.getLocalizedMessage;
        var locFmtMsg = MoreKomodoCommon.getFormattedMessage;
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
                    ko.views.manager.doFileOpen(filesToOpen[i]);
                }
            }
        }
    },

    getUniqFileNames : function(tabView, tabIndex) {
        var arr = [];
        var uniqArr = [];
        var treeColumn = { id: "findresults" + tabIndex + "-filename"};

        for (var i = 0; i < tabView.rowCount; i++) {
            uniqArr[tabView.getCellText(i, treeColumn)] = 1;
        }
        for (var name in uniqArr) {
            arr.push(name);
        }

        return arr;
    },

    onFindBySelection : function(tabIndex) {
        var view = ko.views.manager.currentView;

        if (!(view && view.document && (view.getAttribute("type") == "editor"))) {
            return;
        }
        var sel = view.selection;

        if (sel.length) {
            var tab = FindResultsTab_GetManager(tabIndex);
            var options = this.arrFind[this.arrFind.length - 1].options;
            if (options.patternType == Components.interfaces.koIFindOptions.FOT_REGEX_PYTHON) {
                tab._pattern = convertGlobMetaCharsToRegexpMetaChars(sel);
            } else {
                tab._pattern = sel;
            }
            this.executeFind(tabIndex, options, tab.context_, tab._pattern);
        }
    },

    initRefreshViewMenu : function(event, tabIndex) {
        var menu = event.target;

        MoreKomodoCommon.removeMenuItems(menu);
        // Insert from last (most recent used) to first element
        for (var i = this.arrFind.length - 1; i >= 0; i--) {
            this.appendRefreshItem(menu, this.arrFind[i], tabIndex, i);
        }
        this.insertExtraMenuItems(menu);
    },

    appendRefreshItem : function(menu, findInfo, tabIndex, findIndex) {
        var item = document.createElement("menuitem");
        var label = this.createLabelFromPattern(findInfo);

        item.setAttribute("id", findIndex);
        item.setAttribute("label", label);
        item.setAttribute("tooltip", "morekomodo-refresh-tooltip");
        item.setAttribute("oncommand",
                          "moreKomodoFindResults.onRepeatFind(%1, %2)"
                            .replace("%1", tabIndex)
                            .replace("%2", findIndex));

        menu.appendChild(item);
    },

    onTooltipRefresh : function (targetNode) {
        var findInfo = this.arrFind[targetNode.id];
        var isFindInFile;

        switch (findInfo.context.type) {
            case Components.interfaces.koIFindContext.FCT_IN_FILES:
            case Components.interfaces.koIFindContext.FCT_IN_COLLECTION:
                isFindInFile = true;
                break;
            default:
                isFindInFile = false;
                break;
        }

        if (isFindInFile) {
            document.getElementById("morekomodo-refresh-tooltip-find-in-file")
                .removeAttribute("hidden");
            for (var i in this._tooltipOptions) {
                var opts = this._tooltipOptions[i];
                document
                    .getElementById(opts.id)
                    .setAttribute("value", findInfo.options[opts.property]);
            }
        } else {
            document.getElementById("morekomodo-refresh-tooltip-find-in-file")
                .setAttribute("hidden", true);
        }

        document.getElementById("morekomodo-refresh-tooltip-pattern")
                .setAttribute("value", targetNode.getAttribute("label"));
        return true;
    },

    insertExtraMenuItems : function(menu) {
        var menuitem = document.getElementById("morekomodo-refresh-static-menupopup")
                        .firstChild;
        while (menuitem) {
            var newItem = menuitem.cloneNode(false);
            var newId = "morekomodo-" + newItem.getAttribute("id");
            newItem.setAttribute("id", newId);
            menu.appendChild(newItem);
            menuitem = menuitem.nextSibling;
        }
    },

    createLabelFromPattern : function(findInfo) {
        var arr = findInfo.pattern.split(/\r|\r\n|\n/g);
        var label = arr[0];
        var tooltip = label;
        const maxLen = 14;

        if (label.length > maxLen) {
            label = label.substring(0, maxLen) + "...";
        }
        // Add a paragraph character if pattern is 'multiple line'
        if (arr.length > 1) {
            label += String.fromCharCode(182);
        }

        this.copyOptions(findInfo.options, this._koOptions);

        return this._koOptions.searchDescFromPattern(label);
    },

    removeAllFindInfo : function(event) {
        // First element is left in array
        this.arrFind.splice(1, this.arrFind.length - 1);
    },

    pushItem : function(arr, item, maxItems) {
        if (arr.length >= maxItems) {
            arr.splice(0, 1);
        }
        arr.push(item);
    },

    removeIndex : function(arr, index) {
        var item = arr[index];
        arr.splice(index, 1);

        return item;
    },

    executeFind : function(tabIndex, options, context, pattern) {
        this.copyOptions(options, this._findSvc.options);
        // Ensure output goes on correct tab
        this._findSvc.options.displayInFindResults2 = tabIndex == 2;

        switch (context.type) {
            case Components.interfaces.koIFindContext.FCT_CURRENT_DOC:
            case Components.interfaces.koIFindContext.FCT_SELECTION:
            case Components.interfaces.koIFindContext.FCT_ALL_OPEN_DOCS:
                Find_FindAll(window, context, pattern, null);
                break;
            case Components.interfaces.koIFindContext.FCT_IN_FILES:
            case Components.interfaces.koIFindContext.FCT_IN_COLLECTION:
                Find_FindAllInFiles(window, context, pattern, null);
                break;
            default:
                MoreKomodoCommon.log("Refresh Non supported for type " + context.type);
        }
    },

    getLinesFromFindResults : function(tabIndex, copyFileNames) {
        var tab = FindResultsTab_GetManager(tabIndex);
        tabView = tab.view;

        var arr = [];
        if (copyFileNames) {
            arr = this.getUniqFileNames(tabView, tabIndex);
        } else {
            var treeColumn = { id: "findresults" + tabIndex + "-context"};
            for (var i = 0; i < tabView.rowCount; i++) {
                arr.push(tabView.getCellText(i, treeColumn));
            }
        }

        return arr;
    },

    onCopyToViewFindResults : function(tabIndex, copyFileNames) {
        var arr = this.getLinesFromFindResults(tabIndex, copyFileNames);

        if (arr.length) {
            var view = ko.views.manager.doNewView();
            var scimoz = view.scintilla.scimoz;
            var currNL = getNewlineFromScimoz(scimoz);
            scimoz.text = arr.join(currNL);
        }
    }
}