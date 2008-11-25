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
# Portions created by the Initial Developer are Copyright (C) 2008
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
var findReplaceFavorites = {
    onLoad : function(event) {
        this.prefs = new MoreKomodoPrefs();
        this.initControls();
    },

    initControls: function() {
        this.bundle = document.getElementById("strings");
        this.favoriteListMenu = document.getElementById("favorite-list-menupopup");

        this.searchPattern = document.getElementById('pattern');
        this.replacePattern = document.getElementById('repl');

        this.optRegex = document.getElementById('opt-regex');
        this.optCase = document.getElementById('opt-case');
        this.optWord = document.getElementById('opt-word');
        this.optMultiline = document.getElementById('opt-multiline');
        this.optReplace = document.getElementById('opt-repl');

        this.multilineSearchPattern = document.getElementById('multiline-pattern');
        this.multilineReplacePattern = document.getElementById('multiline-repl');

        this.optConfirmReplacementsInFiles = document.getElementById('confirm-replacements-in-files');
        this.optShowReplaceAllResults = document.getElementById('show-replace-all-results');

        this.searchIn = document.getElementById('search-in-menu');
        this.dirs = document.getElementById('dirs');
        this.optSearchInSubdirs = document.getElementById('search-in-subdirs');
        this.includes = document.getElementById('includes');
        this.excludes = document.getElementById('excludes');
    },

    onAddToFavorites : function() {
        var favoriteName = ko.dialogs.prompt(
            this.bundle.getString("enter.favorite.name"),
            null,
            "",
            this.bundle.getString("favorite.name"));

        if (!favoriteName) {
            return;
        }
        var favoriteArr = this.prefs.readFindReplaceFavorites();

        // used to overwrite element
        var currFavoriteIndex = -1;
        for (var i = 0; i < favoriteArr.length; i++) {
            if (favoriteArr[i].name == favoriteName) {
                var msg = this.bundle.getFormattedString(
                    "confirm.overwrite", [favoriteName]);

                if (ko.dialogs.yesNo(msg, "No") == "No") {
                    return;
                }
                currFavoriteIndex = i;
            }
        }
        var findInfo = {
            name: favoriteName,
            searchPattern : this.searchPattern.value,
            replacePattern : this.replacePattern.value,
            optRegex : this.optRegex.checked,
            optCase : this.optCase.checked,
            optCaseValue : this.optCase.value,
            optWord : this.optWord.checked,
            optMultiline : this.optMultiline.checked,
            optReplace : this.optReplace.checked,
            multilineSearchPattern : this.multilineSearchPattern.value,
            multilineReplacePattern : this.multilineReplacePattern.value,
            optConfirmReplacementsInFiles : this.optConfirmReplacementsInFiles.checked,
            optShowReplaceAllResults : this.optShowReplaceAllResults.checked,

            searchIn : this.searchIn.value,
            optSearchInSubdirs : this.optSearchInSubdirs.checked,
            dirs : this.dirs.value,
            includes : this.includes.value,
            excludes : this.excludes.value
        };
        if (currFavoriteIndex >= 0) {
            favoriteArr[currFavoriteIndex] = findInfo;
        } else {
            favoriteArr.push(findInfo);
            favoriteArr.sort(function(a, b) {
                return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                });
        }
        this.prefs.writeFindReplaceFavorites(favoriteArr);
    },

    restoreFindInfo : function(event) {
        try {
        var menuItem = event.target;
        var findInfo = menuItem["favoriteInfo"];

        // handle three state 'case' checkbox
        // reset to ignore-case
        this.optCase.value = "smart-case";
        this.optCase.checked = true;
        this.optCase.click();
        if (findInfo.optCase) {
            // first click moves to match-case
            this.optCase.click();
            if (findInfo.optCaseValue == "smart-case") {
                // second click moves to smart-case
                this.optCase.click();
            }
        }

        this.setWidgetCheck(this.optRegex, findInfo.optRegex);
        this.setWidgetCheck(this.optWord, findInfo.optWord);
        this.setWidgetCheck(this.optMultiline, findInfo.optMultiline);
        this.setWidgetCheck(this.optReplace, findInfo.optReplace);
        this.setWidgetCheck(this.optSearchInSubdirs, findInfo.optSearchInSubdirs);
        this.setWidgetCheck(this.optConfirmReplacementsInFiles, findInfo.optConfirmReplacementsInFiles);
        this.setWidgetCheck(this.optShowReplaceAllResults, findInfo.optShowReplaceAllResults);

        this.searchIn.value = findInfo.searchIn;
        this.searchIn.doCommand();

        this.searchPattern.focus();
        this.setWidgetValue(this.searchPattern, findInfo.searchPattern, true);
        this.setWidgetValue(this.replacePattern, findInfo.replacePattern, true);
        this.setWidgetValue(this.multilineSearchPattern, findInfo.multilineSearchPattern, true);
        this.setWidgetValue(this.multilineReplacePattern, findInfo.multilineReplacePattern, true);
        this.setWidgetValue(this.dirs, findInfo.dirs, true);
        this.setWidgetValue(this.includes, findInfo.includes, true);
        this.setWidgetValue(this.excludes, findInfo.excludes, true);

        } catch(e) {
          alert(e);
        }
    },

    setWidgetValue : function(textbox, value, dispatchInputEvent) {
        // preserve actual pattern if value is empty
        if (value != "") {
            textbox.value = value;
            // Allow to enable/disable/show/hide buttons
            if (dispatchInputEvent) {
                var inputEvent = document.createEvent("Events");
                inputEvent.initEvent("input", true, true);
                textbox.dispatchEvent(inputEvent);
            }
        }
    },

    setWidgetCheck : function(checkbox, newState) {
        var currState = checkbox.checked;

        if (newState != currState) {
            checkbox.click();
        }
    },

    initPopupMenuFavorites : function() {
        MoreKomodoCommon.removeMenuItems(this.favoriteListMenu);
        var items = this.prefs.readFindReplaceFavorites();

        for (var i = 0; i < items.length; i++) {
            var favoriteInfo = items[i];
            this.appendFavoriteItem(this.favoriteListMenu, favoriteInfo);
        }
    },

    appendFavoriteItem : function(menu, fo) {
        var item = document.createElement("menuitem");

        item.setAttribute("label", fo.name);
        item.setAttribute("oncommand", "findReplaceFavorites.restoreFindInfo(event);");
        item["favoriteInfo"] = fo;
        item.setAttribute("tooltiptext", fo.name);
        menu.appendChild(item);
    },

    onDeleteFavorites : function() {
        var items = this.prefs.readFindReplaceFavorites();
        var answer = ko.dialogs.selectFromList(
                this.bundle.getString("delete.favorite"),
                this.bundle.getString("select.favorite.to.delete"),
                items,
                "zero-or-more",
                function(item) { return item.name; },
                null,
                false,
                null);
        if (answer != null) {
            for (var i = 0; i < answer.length; i++) {
                for (var j = items.length - 1; j >= 0; j--) {
                    if (items[j].name == answer[i].name) {
                        items.splice(j, 1);
                        break;
                    }
                }
            }
            this.prefs.writeFindReplaceFavorites(items);
        }
    }
};

window.addEventListener("load", function(event) { findReplaceFavorites.onLoad(event); }, false);
