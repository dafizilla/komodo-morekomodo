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
     },
    
    onCopyFindResults : function(tabIndex, copyFileNames) {
        var tab = FindResultsTab_GetManager(tabIndex);
        tabView = tab.view;
    
        var arr = [];
        var msg;
        if (copyFileNames) {
            arr = this.getUniqFileNames(tabView, tabIndex);
            msg = MoreKomodoCommon
                .getFormattedMessage("findresults.copy.filenames", [arr.length]);
        } else {
            var treeColumn = { id: "findresults" + tabIndex + "-context"};
            for (var i = 0; i < tabView.rowCount; i++) {
                arr.push(tabView.getCellText(i, treeColumn));
            }
            var msg = MoreKomodoCommon
                .getFormattedMessage("findresults.copy.contents", [arr.length]);
        }
    
        // Is \n multi-platform compliant?
        MoreKomodoCommon.copyToClipboard(arr.join("\n"));
        ko.statusBar.AddMessage(msg, "moreKomodo", 3000, true)
    },
    
    onRefreshFindResults : function(tabIndex) {
        var tab = FindResultsTab_GetManager(tabIndex);
        var findSvc = Components.classes["@activestate.com/koFindService;1"].
                   getService(Components.interfaces.koIFindService);
        // Ensure output goes on correct tab
        findSvc.options.displayInFindResults2 = tabIndex == 2;
        switch (tab.context_.type) {
            case Components.interfaces.koIFindContext.FCT_CURRENT_DOC:
            case Components.interfaces.koIFindContext.FCT_SELECTION:
            case Components.interfaces.koIFindContext.FCT_ALL_OPEN_DOCS:
                Find_FindAll(window, tab.context_, tab._pattern, null);
                break;
            case Components.interfaces.koIFindContext.FCT_IN_FILES:
            case Components.interfaces.koIFindContext.FCT_IN_COLLECTION:
                Find_FindAllInFiles(window, tab.context_, tab._pattern, null);
                break;
            default:
                ko.logging.getLogger("ko.main")
                    .warn("Refresh Non supported for type " + tab.context_.type);
        }
    },
    
    handleRefreshStatus : function(event) {
        if (event.attrName == "disabled") {
            var idName = event.target.id.replace("-stopsearch-button", "-morekomodo-refresh");
            var refreshButton = document.getElementById(idName);
            if (!refreshButton) {
                return;
            }

            if (event.newValue == "true") { // attribute is set
                refreshButton.removeAttribute("disabled");
            }
            if (event.newValue == "" && event.prevValue != "") { // attribute is removed
                refreshButton.setAttribute("disabled", "true");
            }
        }
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
    }
}