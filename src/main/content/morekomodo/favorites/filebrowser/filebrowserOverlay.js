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
var moreKomodoFileBrowser = {
    onLoad : function() {
        this.bundle = document.getElementById("favoriteStrings");
        this.prefs = new MoreKomodoPrefs();
        this.favoriteInfoList = this.prefs.readFavorites();
        this.refreshMenu();
    },

    refreshMenu : function() {
        var menu = document.getElementById("favorites-toolbarMenuPopup");

        MoreKomodoCommon.removeMenuItems(menu);
        for (var i = 0; i < this.favoriteInfoList.length; i++) {
            var favoriteInfo = this.favoriteInfoList[i];
            if (favoriteInfo.type == FAVORITE_REMOTE_DIR) {
                this.appendFavoriteItem(menu, favoriteInfo);
            }
        }

        if (menu.hasChildNodes()) {
            var item = document.createElement("menuseparator");
            menu.appendChild(item);
        }
        this.appendAddFavoriteItem(menu);
    },

    appendFavoriteItem : function(menu, fo) {
        var item = document.createElement("menuitem");

        item.setAttribute("label", fo.label);
        item.setAttribute("oncommand", "moreKomodoFileBrowser.onGotoFavorite(event);");
        item.setAttribute("id", "morekomodo-path-" + fo.path);
        item["favoriteInfo"] = fo;
        item.setAttribute("class", "menuitem-iconic-wide");
        item.setAttribute("image", fo.imageURI);
        item.setAttribute("tooltiptext", fo.path);
        // Paths too long are cropped
        item.setAttribute("crop", "center");
        menu.appendChild(item);
    },

    appendAddFavoriteItem : function(menu) {
        var item = document.createElement("menuitem");

        item.setAttribute("id", "favorites-add-current-folder");
        item.setAttribute("label", this.bundle.getString("add.current.folder.label"));
        item.setAttribute("oncommand", "moreKomodoFileBrowser.onAddCurrentFolder(event);");
        item.setAttribute("accesskey", this.bundle.getString("add.current.folder.accesskey"));

        menu.appendChild(item);
    },

    onGotoFavorite : function(event) {
        try {
            var menuItem = event.target;
            var parts = getURIInfo(menuItem["favoriteInfo"].path);
            var isOk = this.gotoRemotePathFromURIInfo(parts);

            if (!isOk) {
                var message = this.bundle.getFormattedString(
                                "unable.to.find.server.alias",
                                [parts["serveralias"]]);
                ko.dialogs.alert(message);
            }
        } catch (err) {
            alert(err);
        }
    },

    gotoRemotePathFromURIInfo : function(parts) {
        var aliasIndex = getAliasIndex(parts["serveralias"]);
        if (aliasIndex < 0) {
            return false;
        }
        // Add 1 to skip initial empty item
        ++aliasIndex;
        var serverMenuList = document.getElementById("serverMenuList");

        // To preserve history the server changes only if it differs from current selected
        if (aliasIndex != serverMenuList.selectedIndex) {
            serverMenuList.selectedIndex = aliasIndex;
            serverMenuList.doCommand();
        }

        // If connection fails file is null
        var file = newFile(parts["path"]);
        if (file) {
            gotoDirectory(file);
        }

        return true;
    },

    onAddCurrentFolder : function(event) {
        try {

        var folderList = document.getElementById("lookInMenuList");
        if (!folderList.selectedItem) {
            return;
        }
        var path = getUriForPath(folderList.selectedItem.getAttribute("label"));

        if (!path) {
            return;
        }
        if (FavoriteInfo.indexOfPath(this.favoriteInfoList, path) >= 0) {
            ko.dialogs.alert(this.bundle.getString("path.already.present"));
            return;
        }
        var param = {favoriteInfo : new FavoriteInfo(path, FAVORITE_REMOTE_DIR, path),
                     isOk : false,
                     title : this.bundle.getString("add.favorite.title")};

        window.openDialog("chrome://morekomodo/content/favorites/favoriteEdit.xul",
                          "_blank",
                          "chrome,modal,resizable=yes,dependent=yes",
                          param);
        if (param.isOk) {
            this.favoriteInfoList.push(param.favoriteInfo);
            this.prefs.writeFavorites(this.favoriteInfoList);
            this.refreshMenu();
        }
        } catch(e) {
            alert(e);
        }
    },

    initPopupMenuFavorites : function(event) {
        var folderList = document.getElementById("lookInMenuList");
        var menuItemAddFolder = document.getElementById("favorites-add-current-folder");

        if (folderList.selectedItem) {
            menuItemAddFolder.removeAttribute("disabled");
        } else {
            menuItemAddFolder.setAttribute("disabled", "true");
        }
    }
}

window.addEventListener("load", function(event) { moreKomodoFileBrowser.onLoad(event); }, false);
