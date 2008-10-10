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
var gFavorites = {
    onLoad : function() {
        try {
            this.bundle = document.getElementById("strings");
            this.prefs = new MoreKomodoPrefs();
            this.initControls();
        } catch (err) {
            alert(err);
        }
        sizeToContent();
    },

    initControls : function() {
        this.oFileListTree = document.getElementById("fileList-tree");
        this.oDescription = document.getElementById("descriptionFromPath");
        this.oMaxMenuItems = document.getElementById("maxMenuItems");

        this.initValues();
    },

    initValues : function() {
        this.fileListTreeView = new FavoritesTreeView();
        var favoriteInfoArr = this.prefs.readFavorites();
        for (var i = 0; i < favoriteInfoArr.length; i++) {
            this.fileListTreeView.insertFavoriteInfo(favoriteInfoArr[i]);
        }
        this.oMaxMenuItems.value = this.prefs.readMaxFavoriteMenuItems();
        this.oFileListTree.view = this.fileListTreeView;
        this.fileListTreeView.maxMenuItems = this.oMaxMenuItems.value;
        this.fileListTreeView.refresh();
    },

    openSelected : function() {
        var titleLabel = this.bundle.getString("select.file.title");
        var items = this.fileListTreeView.selectedItems;

        for (var i = 0; i < items.length; i++) {
            items[i].open(titleLabel);
        }
        document.documentElement.cancelDialog();
    },

    addFiles : function() {
        var fp = MoreKomodoCommon.makeFilePicker(window,
                        this.bundle.getString("select.file.title"),
                        Components.interfaces.nsIFilePicker.modeOpenMultiple);
        var res = fp.show();
        var isOk = (res == Components.interfaces.nsIFilePicker.returnOK);
        if (isOk) {
            var f = fp.files;
            var isDescByName = this.oDescription.checked;
            while (f.hasMoreElements()) {
                var file = f.getNext().QueryInterface(Components.interfaces.nsILocalFile);

                var favoriteInfo = FavoriteInfo.createInfo(file.path, isDescByName, null, true);
                this.fileListTreeView.insertFavoriteInfo(favoriteInfo);
            }
            this.fileListTreeView.refresh();
        }
    },

    addCurrentFile : function() {
        var mainWindow = ko.windowManager.getMainWindow();
        var document = mainWindow.ko.views.manager.currentView.document;

        if (document.isUntitled) {
            mainWindow.ko.dialogs.alert(this.bundle.getString("path.untitled.document"));
            return;
        }
        var isDescByName = this.oDescription.checked;
        var favoriteInfo = FavoriteInfo.createInfo(null, isDescByName, document.file, false);
        var index = this.fileListTreeView.insertFavoriteInfo(favoriteInfo);
        if (index >= 0) {
            mainWindow.ko.dialogs.alert(this.bundle.getString("path.already.present"));
        }
        this.fileListTreeView.refresh();
    },

    addCurrentFolder : function() {
        var mainWindow = ko.windowManager.getMainWindow();
        var document = mainWindow.ko.views.manager.currentView.document;
        var favoriteInfo = null;

        if (document.isUntitled) {
            mainWindow.ko.dialogs.alert(this.bundle.getString("path.untitled.document"));
            return;
        }

        var isDescByName = this.oDescription.checked;
        var favoriteInfo = FavoriteInfo.createInfo(null, isDescByName, document.file, true);
        if (favoriteInfo) {
            var index = this.fileListTreeView.insertFavoriteInfo(favoriteInfo);
            if (index >= 0) {
                mainWindow.ko.dialogs.alert(this.bundle.getString("path.already.present"));
            }
            this.fileListTreeView.refresh();
        }
    },

    addAllFiles : function() {
        var views = ko.windowManager.getMainWindow().ko.views.manager.topView.getDocumentViews(true);

        var isDescByName = this.oDescription.checked;
        for (var i = 0; i < views.length; i++) {
            var document = views[i].document;
            if (views[i].getAttribute("type") == "startpage" || document.isUntitled)
                continue;
            var favoriteInfo = FavoriteInfo.createInfo(null, isDescByName, document.file, false);
            this.fileListTreeView.insertFavoriteInfo(favoriteInfo);
        }
        this.fileListTreeView.refresh();
    },

    addFolder : function() {
        var fp = MoreKomodoCommon.makeFilePicker(window,
                    this.bundle.getString("select.folder.title"),
                    Components.interfaces.nsIFilePicker.modeGetFolder);
        var res = fp.show();
        var isOk = (res == Components.interfaces.nsIFilePicker.returnOK);
        if (isOk && fp.file) {
            var isDescByName = this.oDescription.checked;
            var favoriteInfo = FavoriteInfo.createInfo(fp.file.path, isDescByName, null, false);
            var index = this.fileListTreeView.insertFavoriteInfo(favoriteInfo);
            if (index >= 0) {
                var mainWindow = ko.windowManager.getMainWindow();
                mainWindow.ko.dialogs.alert(this.bundle.getString("path.already.present"));
            }
            this.fileListTreeView.refresh();
        }
    },

    remove : function() {
        var msg = this.bundle.getString("confirm.delete.from.favorite");
        if (ko.windowManager.getMainWindow().ko.dialogs.yesNo(msg, "No") == "Yes") {
            var treeView = this.fileListTreeView;

            treeView.deleteItems(treeView.selectedIndexes);
            treeView.refresh();
        }
    },

    onEdit : function() {
        try {
        var selIdx = this.fileListTreeView.selectedIndexes[0];
        var selectedItem = this.fileListTreeView.items[selIdx];
        var param = {favoriteInfo : MoreKomodoCommon.clone(selectedItem, true),
                     isOk : false};

        window.openDialog("chrome://morekomodo/content/favorites/favoriteEdit.xul",
                          "_blank",
                          "chrome,modal,resizable=yes,dependent=yes",
                          param);
        if (param.isOk) {
            var newPath = param.favoriteInfo.path;
            if (selectedItem.path == newPath) {
                selectedItem.description = param.favoriteInfo.description;
            } else {
                var currIdx = this.fileListTreeView.indexOfPath(newPath);
                if (currIdx >= 0) {
                    alert(this.bundle.getString("path.already.present"));
                    return;
                }
                var favoriteInfo = FavoriteInfo.createInfo(newPath, false);
                favoriteInfo.description = param.favoriteInfo.description;

                // replace new element at current position
                this.fileListTreeView.items[selIdx] = favoriteInfo;
            }
            this.fileListTreeView.refresh();
        }
        } catch (err){
            alert(err);
        }
    },

    onSelect : function() {
        var view = this.oFileListTree.view;
        var selection = view.selection;
        var selIdx = selection.currentIndex;
        var selCount = selection.count;

        if (!view.selection.isSelected(selIdx)) {
            selIdx = -1;
        }

        // Irrespective to view.rowCount == 0 the tree at startup always has one
        // selected item so we reset selCount
        if (view.rowCount == 0) {
            selCount = 0;
        }

        var upButton = document.getElementById("moveUpButton");
        var downButton = document.getElementById("moveDownButton");
        var removeButton = document.getElementById("removeButton");
        var openButton = document.getElementById("open");
        var editButton = document.getElementById("editButton");

        upButton.disabled = selIdx <= 0;
        downButton.disabled = selIdx < 0 || selIdx >= view.rowCount - 1;
        removeButton.disabled = selCount == 0;
        openButton.disabled = selCount == 0;
        editButton.disabled = selCount != 1;

        var selectedPath = document.getElementById("selectedPath");
        if (selCount == 1) {
            selectedPath.value = this.fileListTreeView.items[selIdx].path;
        } else {
            selectedPath.value = "";
        }
    },

    onCancel : function() {
        try {
        this.prefs.writeFavorites(this.fileListTreeView.items);
        this.prefs.writeMaxFavoriteMenuItems(this.oMaxMenuItems.value);
        } catch (err) {
            alert(err);
        }
    },

    onTreeKeyPress : function(event) {
        if (event.ctrlKey) {
            var key = String.fromCharCode(event.which).toLowerCase();
            if (key == 'a') {
                var view = event.target.treeBoxObject.view;
                var selection = view.selection;

                selection.rangedSelect(0, view.rowCount - 1, true);
            }
        }
    },

    onDblClick : function(event) {
        if (event.button == 0) {
            var view = this.oFileListTree.view;
            var selection = view.selection;
            if (selection.count) {
                this.openSelected(event);
            }
        }
    },

    onMaxItemKeyPress : function(event) {
        this.fileListTreeView.maxMenuItems = this.oMaxMenuItems.value;
        this.fileListTreeView.refresh();
    }
};