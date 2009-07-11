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
var moreKomodoRunOutputResults = {
    onLoad : function() {
        var listButtonWidget = document.getElementById("runoutput-list-button");

        this.enableCopyButton(!listButtonWidget.hasAttribute("disabled"));

        if (listButtonWidget) {
            var self = this;

            this.handle_copy_setup = function(event) {
                self.handleCopy(event);
            };
            listButtonWidget.addEventListener("DOMAttrModified",
                        this.handle_copy_setup,
                        false);
        }

        // Allow to select items to copy
        var treeWidget = document.getElementById("runoutput-tree");
        if (treeWidget) {
            treeWidget.setAttribute("context", "moreKomodoRunOutputResultsContext");
        }

        window.controllers.appendController(this);
     },

    handleCopy : function(event) {
        if (event.attrName == "disabled") {
            if (event.newValue == "true") { // attribute is set
                this.enableCopyButton(false);
            }
            if (event.newValue == "" && event.prevValue != "") { // attribute is removed
                this.enableCopyButton(true);
            }
        }
    },

    enableCopyButton : function(isEnabled) {
        var button = document.getElementById("runoutput-morekomodo-toolbar-copy");

        if (isEnabled) {
            button.removeAttribute("disabled");
        } else {
            button.setAttribute("disabled", "true");
        }
    },

    supportsCommand : function(cmd) {
        switch (cmd) {
            case "cmd_morekomodo_copyRunOutputToViewFileNames":
            case "cmd_morekomodo_copyRunOutputToViewContents":
                return true;
        }
        return false;
    },

    isCommandEnabled : function(cmd) {
        switch (cmd) {
            case "cmd_morekomodo_copyRunOutputToViewFileNames":
            case "cmd_morekomodo_copyRunOutputToViewContents":
                return true;
        }
        return false;
    },

    doCommand : function(cmd) {
        switch (cmd) {
            case "cmd_morekomodo_copyRunOutputToViewFileNames":
                this.onCopyToViewRunOutputResults(true);
                break;
            case "cmd_morekomodo_copyRunOutputToViewContents":
                this.onCopyToViewRunOutputResults(false);
                break;
        }
    },

    onEvent : function(evt) {
    },

    get runOutputTreeView() {
        var boxObject = document.getElementById("runoutput-tree")
                    .treeBoxObject
                    .QueryInterface(Components.interfaces.nsITreeBoxObject);
        return boxObject.view;
    },

    onCopyToViewRunOutputResults : function(copyFileNames, useSelectedItems) {
        var columnId = this.getColumnIdFromType(copyFileNames
                            ? moreKomodoFindResultsUtil.FILE_PATH : moreKomodoFindResultsUtil.CONTENT);

        moreKomodoFindResultsUtil.copyResultsToView(
                            this.runOutputTreeView,
                            [columnId],
                            copyFileNames,
                            useSelectedItems);
    },

    getColumnIdFromType : function(resultType) {
        switch (resultType) {
            case moreKomodoFindResultsUtil.LINE_NUMBER:
                return "runoutput-tree-line";
                break;
            case moreKomodoFindResultsUtil.FILE_PATH:
                return "runoutput-tree-file";
                break;
            case moreKomodoFindResultsUtil.CONTENT:
                return "runoutput-tree-content";
                break;
        }
        return "runoutput-tree-content";
    },

    onCopyToViewCustomFindResults : function(useSelectedItems) {
        var format = moreKomodoFindResultsUtil.openCustomFormatDialog();

        if (format) {
            var copyFileNames = format.length == 1
                && format[0] == moreKomodoFindResultsUtil.FILE_PATH;
            var arrIds = [];

            for (var i = 0; i < format.length; i++) {
                arrIds.push(this.getColumnIdFromType(parseInt(format[i])));
            }

            moreKomodoFindResultsUtil.copyResultsToView(
                        this.runOutputTreeView,
                        arrIds,
                        copyFileNames,
                        useSelectedItems);
        }
    }
}

window.addEventListener("load", function(event) { moreKomodoRunOutputResults.onLoad(event); }, false);
