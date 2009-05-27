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
xtk.include("domutils");

var moreKomodo = {
    _fileTimeInfo : null,
    _prefs : new MoreKomodoPrefs(),

    _bundle : Components.classes["@mozilla.org/intl/stringbundle;1"]
                .getService(Components.interfaces.nsIStringBundleService)
                .createBundle("chrome://morekomodo/locale/favorites.properties"),

    onLoad : function() {
        var obs = MoreKomodoCommon.getObserverService();
        obs.addObserver(this, "morekomodo_pref_changed", false);
        obs.addObserver(this, "morekomodo_command", false);

        obs.addObserver(this, "current_view_changed", false);
        obs.addObserver(this, "file_changed", false);
        // This listener is notified from checkDiskFiles
        obs.addObserver(this, "file_update_now", false);
        obs.addObserver(this, "current_view_linecol_changed", false);
        window.controllers.appendController(this);

        obs.notifyObservers(null, "morekomodo_pref_changed", "statusbar");

        this.addListeners();
    },

    onUnLoad : function() {
        var obs = MoreKomodoCommon.getObserverService();
        obs.removeObserver(this, "morekomodo_pref_changed");
        obs.removeObserver(this, "morekomodo_command");

        obs.removeObserver(this, "current_view_changed");
        obs.removeObserver(this, "file_changed");
        obs.removeObserver(this, "file_update_now");
        obs.removeObserver(this, "current_view_linecol_changed");

        window.controllers.removeController(this);
        this.removeListeners();
    },

    observe : function(subject, topic, data) {
        try {
        switch (topic) {
            case "current_view_changed":
                this._updateFileTimeStatusbarFromView(subject);
                this._updateLockEdit(subject);
                break;
            case "file_changed":
                this._updateFileTimeStatusbarFromUrl(data);
                break;
            case "morekomodo_pref_changed":
                this.moreKomodoPrefsChanged(subject, data);
                break;
            case "file_update_now":
                // data should contain url but is never set so we update only
                // the current view, other views will be updated on current_view_changed
                this._updateFileTimeStatusbarFromView(ko.views.manager.currentView);
                break;
            case "morekomodo_command":
                this._updateViewsByCommand(subject.wrappedJSObject);
                break;
            case "current_view_linecol_changed":
                this.onViewLineColChanged();
                break;
        }
        } catch (err) {
            alert(topic + "--" + data + "\n" + err);
        }
    },

    _updateViewsByCommand : function(commandInfo) {
        switch (commandInfo.command) {
            case "rename":
            case "move":
                // handle splitted view
                var list = ko.views.manager.topView.findViewsForDocument(commandInfo.document);
                for (i in list) {
                    var view = list[i];
                    var caretPosition = getCaretPosition(view);
                    view.document = commandInfo.newDocument;
                    moveCaret(view, caretPosition);
                    this.updateView(view);
                    // ensure colourise is applied
                    ko.commands.doCommand('cmd_viewAsGuessedLanguage');
                }

                // update the mru list
                var uriView = commandInfo.document.file.URI;
                var index = MoreKomodoCommon.getMruUriIndex("mruFileList", uriView);
                if (index >= 0) {
                    ko.mru.del("mruFileList", index);
                    ko.mru.addURL("mruFileList", commandInfo.newDocument.file.URI);
                }
                ko.views.manager.currentView.setFocus();
                break;
            case "delete":
                var list = ko.views.manager.topView.findViewsForDocument(commandInfo.document);
                var uriView = commandInfo.document.file.URI;
                for (i in list) {
                    list[i].closeUnconditionally();
                }

                // update the mru list
                var index = MoreKomodoCommon.getMruUriIndex("mruFileList", uriView);
                if (index >= 0) {
                    ko.mru.del("mruFileList", index);
                }
                break;
            case "lock":
                var list = ko.views.manager.topView.findViewsForDocument(commandInfo.document);
                for (i in list) {
                    var view = list[i];
                    view.scintilla.scimoz.readOnly = commandInfo.readOnly;
                    this._updateLockEdit(view);
                }
                break;
        }
    },

    moreKomodoPrefsChanged : function(subject, data) {
        if (data == "statusbar" || data == "all") {
            this._fileTimeInfo = this._prefs.readFileTimeInfo();
            var bar = document.getElementById("statusbar-morekomodo-filetime");
            if (this._fileTimeInfo.isEnabled) {
                bar.removeAttribute("collapsed");
                // On ko5 the manager should be null
                if (ko.views && ko.views.manager) {
                    this._updateFileTimeStatusbarFromView(ko.views.manager.currentView);
                }
            } else {
                bar.setAttribute("collapsed", "true");
            }

            var bar = document.getElementById("statusbar-morekomodo-charcode");
            if (this._prefs.showUnicodeStatusbar) {
                bar.removeAttribute("collapsed");
            } else {
                bar.setAttribute("collapsed", "true");
            }
        }
    },

    _updateFileTimeStatusbarFromView : function(view) {
        var file = null;

        if (!ko.views.manager.batchMode
            && view
            && view.getAttribute("type") == "editor"
            && view.document) {
            file = view.document.file;
        }
        this._updateFileTimeStatusbar(file);
    },

    _updateFileTimeStatusbarFromUrl : function(uri) {
        var fileEx;

        var views = ko.views.manager.topView.findViewsForURI(uri);
        // Get cached file informations
        if (views.length > 0 && views[0].document.file.isRemoteFile) {
            fileEx = views[0].document.file;
        } else {
            fileEx = MoreKomodoCommon.makeIFileExFromURI(uri);
        }
        this._updateFileTimeStatusbar(fileEx);
    },

    _updateFileTimeStatusbar : function(fileEx) {
        if (!this._fileTimeInfo.isEnabled) {
            return;
        }

        var date = "";
        if (fileEx) {
            var timeSvc = Components.classes["@activestate.com/koTime;1"].
                          getService(Components.interfaces.koITime);

            var timeTuple = timeSvc.localtime(fileEx.lastModifiedTime, new Object());
            var timeFormat = this._fileTimeInfo.timeFormat;
            date = timeSvc.strftime(timeFormat, timeTuple.length, timeTuple);
        }

        var bar = document.getElementById("statusbar-morekomodo-filetime");
        bar.setAttribute("label", date);
    },

    onRenameFile : function() {
        var currView = ko.views.manager.currentView;
        var viewDoc = currView.document;
        var title = MoreKomodoCommon.getLocalizedMessage("rename.title");
        var oldName = viewDoc.file.baseName;
        var newName = ko.dialogs.prompt(oldName, null, oldName, title);

        try {
            if (newName && newName != oldName) {
                var newPath = MoreKomodoCommon.renameFile(viewDoc.displayPath, newName);
                if (newPath) {
                    // Reopen file at same tab position
                    var newDoc = MoreKomodoCommon.createDocumentFromURI(newPath);
                    // the observer will set the new document also for this view
                    var data = {document : viewDoc,
                                newDocument : newDoc,
                                command : "rename"
                                };
                    data.wrappedJSObject = data;

                    var obs = MoreKomodoCommon.getObserverService();
                    obs.notifyObservers(data, "morekomodo_command", null);
                }
            }
        } catch (err) {
            alert("Error while renaming " + err);
        }
    },

    onDeleteFile : function() {
        try {
            var view = ko.views.manager.currentView;
            var file = view.document.file;
            var msg = MoreKomodoCommon.getLocalizedMessage("confirm.delete.file");

            if (ko.dialogs.yesNo(msg, "No", file.displayPath) == "Yes") {
                MoreKomodoCommon.deleteFile(file.displayPath);
                // the observer will close also calling view
                var data = {document : view.document,
                            command : "delete"
                            };
                data.wrappedJSObject = data;

                var obs = MoreKomodoCommon.getObserverService();
                obs.notifyObservers(data, "morekomodo_command", null);
            }
        } catch (err) {
            alert(err);
        }
    },

    onMakeBackup : function() {
        try {
            var view = ko.views.manager.currentView;
            var file = view.document.file;
            var currentPath = MoreKomodoCommon.makeLocalFile(file.path);
            var msg = MoreKomodoCommon.getLocalizedMessage("select.backup.file.title");
            var fp = MoreKomodoCommon.makeFilePicker(window,
                        msg,
                        Components.interfaces.nsIFilePicker.modeSave,
                        currentPath.parent);
            fp.defaultString = currentPath.leafName;
            var res = fp.show();
            var isOk = (res == Components.interfaces.nsIFilePicker.returnOK
                        || res == Components.interfaces.nsIFilePicker.returnReplace);
            if (isOk && fp.file) {
                MoreKomodoCommon.backupFile(currentPath, fp.file);
            }
            view.setFocus();
        } catch (err) {
            alert("Unable to make backup: " + err);
        }
    },

    onCopyFullPath : function() {
        var view = ko.views.manager.currentView;
        var file = view.document.displayPath;

        MoreKomodoCommon.copyToClipboard(file);
        view.setFocus();
    },

    onCopyDirectoryPath : function() {
        var view = ko.views.manager.currentView;
        var document = view.document;
        var file = document.file;
        var dirName = file.dirName;

        if (file.isRemoteFile) {
            dirName = file.scheme + "://" + file.server + dirName;
        }

        MoreKomodoCommon.copyToClipboard(dirName);
        view.setFocus();
    },

    onCopyFileName : function() {
        var view = ko.views.manager.currentView;
        var file = view.document.baseName;

        MoreKomodoCommon.copyToClipboard(file);
        view.setFocus();
    },

    openFavorites : function() {
        window.openDialog("chrome://morekomodo/content/favorites/favorites.xul",
                          "_blank",
                          "chrome,modal,resizable=yes,dependent=yes");
    },

    onOpenSortDialog : function() {
        var param = {sortOptions : new SortOptions(),
                     view : ko.views.manager.currentView,
                     isOk : false};
        window.openDialog("chrome://morekomodo/content/sortDialog.xul",
                          "_blank",
                          "chrome,modal,resizable=no,dependent=yes",
                          param);
        if (param.isOk) {
            sortView(ko.views.manager.currentView, param.sortOptions);
        }
    },

    initPopupMenuFavorites : function(showAll) {
        var menu = document.getElementById("favorites-toolbarMenuPopup");

        MoreKomodoCommon.removeMenuItems(menu);
        var prefs = new MoreKomodoPrefs();
        var items = prefs.readFavorites();
        if (items.length > 0) {
            var maxItems = prefs.readMaxFavoriteMenuItems();
            if (maxItems <= 0) {
                maxItems = items.length;
            }

            if (typeof(showAll) == "undefined") {
                showAll = false;
            }

            var itemCount;
            var showExpandItem;

            if (showAll) {
                itemCount = items.length;
                showExpandItem = false;
            } else {
                itemCount = Math.min(maxItems, items.length);
                showExpandItem = true;
            }
            for (var i = 0; i < itemCount; i++) {
                var favoriteInfo = items[i];
                if (favoriteInfo.isValid()) {
                    this.appendFavoriteItem(menu, favoriteInfo);
                }
            }
            // No need to append menu when items are less than maxItems
            if (items.length <= maxItems) {
                showExpandItem = false;
            }
            if (showExpandItem) {
                this.appendExpandFavoriteItem(menu);
            }
        } else {
            this.appendEmptyFavoriteItem(menu);
        }
    },

    appendExpandFavoriteItem : function(menu) {
        var menusep = document.createElement("menuseparator");

        menu.appendChild(menusep);

        var item = document.createElement("menuitem");

        var label = this._bundle.GetStringFromName("show.all.favorites");
        item.setAttribute("label", label);
        item.setAttribute("tooltiptext", label);
        item.setAttribute("oncommand", "moreKomodo.onExpandFavorites(event)");

        menu.appendChild(item);
    },

    onExpandFavorites : function(event) {
        var self = this;
        window.setTimeout(function() {
            document.getElementById("button-favorites").open = true;
            self.initPopupMenuFavorites(true);
            }, 100);
    },

    appendEmptyFavoriteItem : function(menu) {
        var item = document.createElement("menuitem");

        var emptyLabel = this._bundle.GetStringFromName("empty.favorite");
        item.setAttribute("label", emptyLabel);
        item.setAttribute("command", "cmd_morekomodo_favorites");
        item.setAttribute("key", "key_cmd_morekomodo-favorites");

        menu.appendChild(item);
    },

    appendFavoriteItem : function(menu, fo) {
        var item = document.createElement("menuitem");

        item.setAttribute("label", fo.label);
        item.setAttribute("oncommand", "moreKomodo.onOpenFavoritesFromMenu(event);");
        item.setAttribute("id", "morekomodo-path-" + fo.path);
        item["favoriteInfo"] = fo;
        item.setAttribute("class", "menuitem-iconic");
        item.setAttribute("image", fo.imageURI);
        item.setAttribute("tooltiptext", fo.path);
        // Paths too long are cropped
        item.setAttribute("crop", "center");
        menu.appendChild(item);
    },

    onConvertSelection : function(event, fn) {
        var view = ko.views.manager.currentView;

        if (view && view.getAttribute('type') == 'editor') {
            applyConversionToSelection(view, fn, true);
        }
    },

    onOpenFavoritesFromMenu : function(event) {
        try {
        var menuItem = event.target;
        var fi = menuItem["favoriteInfo"];

        fi.open(this._bundle.GetStringFromName("select.file.title"));
        } catch (err) {
            alert(err);
        }
    },

    goUpdateFileMenuItems : function() {
        goUpdateCommand("cmd_morekomodo_makeBackup");
        goUpdateCommand("cmd_morekomodo_copyappend");
        goUpdateCommand("cmd_morekomodo_cutappend");
        goUpdateCommand("cmd_morekomodo_sort");
        goUpdateCommand("cmd_morekomodo_lockedit");
        goUpdateCommand("cmd_morekomodo_rename");
        goUpdateCommand("cmd_morekomodo_delete");
        goUpdateCommand("cmd_morekomodo_copyFullPath");
        goUpdateCommand("cmd_morekomodo_copyFileName");
        goUpdateCommand("cmd_morekomodo_copyDirectoryPath");
        goUpdateCommand("cmd_morekomodo_move");
        goUpdateCommand("cmd_morekomodo_showInFileManager");
    },

    goUpdateClipboarcMenuItems : function() {
        goUpdateCommand("cmd_morekomodo_pastehtml");
    },

    supportsCommand : function(cmd) {
        switch (cmd) {
            case "cmd_morekomodo_makeBackup":
            case "cmd_morekomodo_pastehtml":
            case "cmd_morekomodo_copyappend":
            case "cmd_morekomodo_cutappend":
            case "cmd_morekomodo_sort":
            case "cmd_morekomodo_lockedit":
            case "cmd_morekomodo_rename":
            case "cmd_morekomodo_delete":
            case "cmd_morekomodo_copyFullPath":
            case "cmd_morekomodo_copyFileName":
            case "cmd_morekomodo_copyDirectoryPath":
            case "cmd_morekomodo_move":
            case "cmd_morekomodo_showInFileManager":
            case "cmd_morekomodo_unicodetable":
                return true;
        }
        return false;
    },

    isCommandEnabled : function(cmd) {
        // at startup with no file open manager is null
        var view = ko.views.manager && ko.views.manager.currentView;

        switch (cmd) {
            case "cmd_morekomodo_rename":
            case "cmd_morekomodo_delete":
            case "cmd_morekomodo_copyFullPath":
            case "cmd_morekomodo_copyFileName":
            case "cmd_morekomodo_copyDirectoryPath":
                if (view && view.document) {
                    return !(view.document.isUntitled
                            || view.getAttribute("type") != "editor");
                }
                return false;
            case "cmd_morekomodo_move":
            case "cmd_morekomodo_showInFileManager":
            case "cmd_morekomodo_makeBackup":
                // These commands aren't supported on remote
                if (view && view.document) {
                    return !(view.document.isUntitled
                            || view.getAttribute("type") != "editor"
                            || view.document.file.isRemoteFile);
                }
                return false;
            case "cmd_morekomodo_pastehtml":
                return MoreKomodoCommon.hasClipboardHtml();
            case "cmd_morekomodo_copyappend":
                return view && view.getAttribute('type') == 'editor';
            case "cmd_morekomodo_cutappend":
                return view && view.getAttribute('type') == 'editor';
            case "cmd_morekomodo_sort":
                if (view && view.document) {
                    return view.getAttribute("type") == "editor";
                }
                return false;
            case "cmd_morekomodo_lockedit":
                return view && view.getAttribute('type') == 'editor' && view.document;
            case "cmd_morekomodo_unicodetable":
                return true;
        }
        return false;
    },

    doCommand : function(cmd) {
        switch (cmd) {
            case "cmd_morekomodo_rename":
                this.onRenameFile();
                break;
            case "cmd_morekomodo_delete":
                this.onDeleteFile();
                break;
            case "cmd_morekomodo_copyFullPath":
                this.onCopyFullPath();
                break;
            case "cmd_morekomodo_copyFileName":
                this.onCopyFileName();
                break;
            case "cmd_morekomodo_copyDirectoryPath":
                this.onCopyDirectoryPath();
                break;
            case "cmd_morekomodo_move":
                this.onMoveFile();
                break;
            case "cmd_morekomodo_showInFileManager":
                this.onShowInFileManager();
                break;
            case "cmd_morekomodo_makeBackup":
                this.onMakeBackup();
                break;
            case "cmd_morekomodo_pastehtml":
                this.onPasteHtml();
                break;
            case "cmd_morekomodo_copyappend":
                this.onCopyAppend();
                break;
            case "cmd_morekomodo_cutappend":
                this.onCutAppend();
                break;
            case "cmd_morekomodo_sort":
                this.onOpenSortDialog();
                break;
            case "cmd_morekomodo_lockedit":
                this.onToogleLockEdit();
                break;
            case "cmd_morekomodo_unicodetable":
                this.onOpenUnicodeDialog();
                break;
        }
    },

    onEvent : function(evt) {
    },

    onPasteHtml : function() {
        var view = ko.views.manager.currentView;

        if (view && view.getAttribute('type') == 'editor') {
            var htmlText = MoreKomodoCommon.getHtmlFromClipboard();
            if (htmlText) {
                view.scintilla.scimoz.replaceSel(htmlText);
            }
        }
    },

    onCopyAppend : function() {
        var view = ko.views.manager.currentView;
        var curr = "";

        if (MoreKomodoCommon.hasDataMatchingFlavors(["text/unicode"])) {
            curr = MoreKomodoCommon.pasteFromClipboard();
        }
        MoreKomodoCommon.copyToClipboard(curr + getSelection(view));
    },

    onCutAppend : function() {
        this.onCopyAppend();
        ko.commands.doCommand("cmd_delete");
    },

    onShowInFileManager : function() {
        var view = ko.views.manager.currentView;
        var path = view.document.file.path;

        Components.classes["@activestate.com/koSysUtils;1"]
            .getService(Components.interfaces.koISysUtils)
            .ShowFileInFileManager(path);
    },

    onMoveFile : function() {
        try {
            var currView = ko.views.manager.currentView;
            var file = currView.document.file;
            var currentPath = MoreKomodoCommon.makeLocalFile(file.path);
            var msg = MoreKomodoCommon.getLocalizedMessage("select.move.file.title");
            var fp = MoreKomodoCommon.makeFilePicker(window,
                        msg,
                        Components.interfaces.nsIFilePicker.modeSave,
                        currentPath.parent);
            fp.defaultString = currentPath.leafName;
            var res = fp.show();
            var isOk = (res == Components.interfaces.nsIFilePicker.returnOK
                        || res == Components.interfaces.nsIFilePicker.returnReplace);
            if (isOk && fp.file) {
                if (fp.file.exists()) {
                    fp.file.remove(false);
                }
                currentPath.copyTo(fp.file.parent, fp.file.leafName);
                MoreKomodoCommon.deleteFile(file.path);

                var viewDoc = currView.document;
                // Reopen file at same tab position
                var newDoc = MoreKomodoCommon.createDocumentFromURI(fp.file.path);
                // the observer will set the new document also for this view
                var data = {document : viewDoc,
                            newDocument : newDoc,
                            command : "move"
                            };
                data.wrappedJSObject = data;
                var obs = MoreKomodoCommon.getObserverService();
                obs.notifyObservers(data, "morekomodo_command", null);
            }
        } catch (err) {
            alert("Unable to move file: " + err);
        }
    },

    _updateLockEdit : function(view) {
        var button = document.getElementById("cmd_morekomodo_lockedit");

        if (view
            && view.getAttribute('type') == 'editor'
            && view.document) {
            if (view.scintilla.scimoz.readOnly) {
                button.setAttribute("checked", "true");
            } else {
                button.removeAttribute("checked");
            }
        } else {
            // Disabled button always shown as unlocked
            button.removeAttribute("checked");
        }
    },

    onToogleLockEdit : function() {
        var view = ko.views.manager.currentView;
        if (view && view.getAttribute('type') == 'editor') {
            var data = {document : view.document,
                        readOnly : !view.scintilla.scimoz.readOnly,
                        command : "lock"
                        };
            data.wrappedJSObject = data;
            var obs = MoreKomodoCommon.getObserverService();
            obs.notifyObservers(data, "morekomodo_command", null);
        }
    },

    addListeners : function() {
        var self = this;

        this.handle_current_view_changed_setup = function(event) {
            self.onCurrentViewChanged(event);
        };

        this.handle_current_view_closed_setup = function(event) {
            self.onCurrentViewClosed(event);
        };

        this.handle_current_view_linecol_changed_setup = function(event) {
            self.onViewLineColChanged(event);
        };

        window.addEventListener('current_view_changed',
                                this.handle_current_view_changed_setup, false);
        window.addEventListener('view_closed',
                                this.handle_current_view_closed_setup, false);
        window.addEventListener('current_view_linecol_changed',
                                this.handle_current_view_linecol_changed_setup, false);
    },

    removeListeners : function() {
        window.removeEventListener('current_view_changed',
                                this.handle_current_view_changed_setup, false);
        window.removeEventListener('view_closed',
                                this.handle_current_view_closed_setup, false);
        window.removeEventListener('current_view_linecol_changed',
                                this.handle_current_view_linecol_changed_setup, false);
    },

    onCurrentViewChanged : function(event) {
        var currView = event.originalTarget;

        this._updateFileTimeStatusbarFromView(currView);
        this._updateLockEdit(currView);
    },

    onCurrentViewClosed : function(event) {
        var currView = event.originalTarget;

        this._updateFileTimeStatusbarFromView(currView);
        this._updateLockEdit(currView);
    },

    // update title and other stuff
    updateView : function(view) {
        //ko.uilayout.updateTitlebar(view);
        MoreKomodoCommon.getObserverService()
            .notifyObservers(view, 'current_view_changed', '');
        if (typeof(xtk.domutils.fireEvent) != "undefined") {
            xtk.domutils.fireEvent(view, 'current_view_changed');
        }
    },

    clearTerminalView : function () {
        var terminalView = document.getElementById("runoutput-scintilla");
    
        if (terminalView && terminalView.terminalHandler != null) {
            var prevReadOnly = terminalView.scimoz.readOnly;
            terminalView.scimoz.readOnly = 0;
            terminalView.clear();
            terminalView.scimoz.readOnly = prevReadOnly;
        }
        ko.views.manager.currentView.setFocus();
    },
    
    onOpenUnicodeDialog : function() {
        ko.windowManager.openOrFocusDialog("chrome://morekomodo/content/unicodeTable/unicodeTable.xul",
                          "morekomodo_unicodetable",
                          "chrome,close=yes,resizable=yes");
    },
    
    onViewLineColChanged : function() {
        var widgetCharCode = document.getElementById("statusbar-morekomodo-charcode");
        if (widgetCharCode.hasAttribute("collapsed")) {
            return;
        }
        var view = ko.views.manager.currentView;
        var msg = "";

        if (view && (view.scimoz.selectionStart != view.scimoz.selectionEnd)) {
            if (view.scimoz.currentPos == view.scimoz.selectionStart) {
                // the cursor is at beginning of selection
                ch = view.scimoz.getWCharAt(view.scimoz.selectionStart).charCodeAt(0);
            } else {
                // the cursor is at end of selection 
                ch = view.scimoz.getWCharAt(view.scimoz.selectionEnd - 1).charCodeAt(0);
            }
            var code = sprintf("%04X", ch);
            msg = MoreKomodoCommon.getFormattedMessage("charcode.label", [code]);
        }

        widgetCharCode.setAttribute("label", msg);
    }
};

window.addEventListener("load", function(event) { moreKomodo.onLoad(event); }, false);
window.addEventListener("unload", function(event) { moreKomodo.onUnLoad(event); }, false);
