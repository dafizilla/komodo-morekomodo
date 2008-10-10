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
const FAVORITE_DIR = 1;
const FAVORITE_FILE = 2;
const FAVORITE_NO_MORE_VALID = 3;
const FAVORITE_REMOTE_FILE = 4;
const FAVORITE_REMOTE_DIR = 5;

function FavoriteInfo(path, type, description) {
    this._file = null;
    this._path = null;
    this._type = FAVORITE_NO_MORE_VALID;
    this._imageURI  = "chrome://morekomodo/skin/error.png";
    this._label = null;

    // set _description using setter
    this.description = description;
    this.setPath(path, type);
}

FavoriteInfo.prototype = {
    get imageURI() {
        return this._imageURI;
    },

    get label() {
        return this._label;
    },

    isValid : function() {
        return this._type != FAVORITE_NO_MORE_VALID;
    },

    get description() {
        return this._description;
    },

    set description(description) {
        if (description) {
            this._description = description;
        } else {
            this._description = "";
        }
        this._updateLabel();
    },

    get path() {
        return this._path;
    },

    get type() {
        return this._type;
    },

    _updateLabel : function() {
        if (this._description) {
            this._label = this._description;
        } else {
            this._label = this._path;
        }
    },

    isRemote : function() {
        return this._type == FAVORITE_REMOTE_DIR || this._type == FAVORITE_REMOTE_FILE;
    },

    isFile : function() {
        return this._type == FAVORITE_REMOTE_FILE || this._type == FAVORITE_FILE;
    },

    isDirectory : function() {
        return this._type == FAVORITE_REMOTE_DIR || this._type == FAVORITE_DIR;
    },

    /**
     * Set the path for this favoriteInfo.
     * @param path contains the full path (local or remote)
     * @param type the path type
     * type is used only for FAVORITE_REMOTE_XXX, in other cases is detected internally
     */
    setPath : function(path, type) {
        this._file = null;
        this._path = path;
        this._type = FAVORITE_NO_MORE_VALID;
        this._imageURI  = "chrome://morekomodo/skin/error.png";

        if (!path) {
            return;
        }

        var isLocal = true;
        intType = parseInt(type);
        // handle remote file
        switch (intType) {
            case FAVORITE_REMOTE_FILE:
                this._file = null;
                this._type = intType;
                this._imageURI = "chrome://morekomodo/skin/file_remote.png";
                isLocal = false;
                break;
            case FAVORITE_REMOTE_DIR:
                this._file = null;
                this._type = intType;
                this._imageURI = "chrome://morekomodo/skin/folder_remote.png";
                isLocal = false;
                break;
        }

        if (isLocal) {
            try {
                this._file = MoreKomodoCommon.makeLocalFile(path);
                if (this._file.isDirectory()) {
                    this._type = FAVORITE_DIR;
                    this._imageURI = "chrome://morekomodo/skin/folder.png";
                } else {
                    this._type = FAVORITE_FILE;
                    this._imageURI = "chrome://morekomodo/skin/file.png";
                }
            } catch (err) {
            }
        }
        this._updateLabel();
    },

    open : function(selectFileTitle) {
        try {
            // Using ko.views.manager.doFileOpen the document isn't shared
            // among multiple windows so the ko.open package is used
            var koOpen = ko.windowManager.getMainWindow().ko.open;
            switch (this._type) {
                case FAVORITE_FILE:
                    koOpen.URI(this._path);
                    break;
                case FAVORITE_DIR:
                    var fp = MoreKomodoCommon.makeFilePicker(
                                window,
                                selectFileTitle,
                                Components.interfaces.nsIFilePicker.modeOpenMultiple,
                                this._file);
                    var res = fp.show();
                    var isOk = (res == Components.interfaces.nsIFilePicker.returnOK);
                    if (isOk) {
                        var f = fp.files;
                        while (f.hasMoreElements()) {
                            var file = f.getNext()
                                .QueryInterface(Components.interfaces.nsILocalFile);
                            koOpen.URI(file.path);
                        }
                    }
                    break;
                case FAVORITE_NO_MORE_VALID:
                    // handle error
                    break;
                case FAVORITE_REMOTE_FILE:
                    koOpen.URI(this._path);
                    break;
                case FAVORITE_REMOTE_DIR:
                    ko.filepicker.openRemoteFiles(this._path);
                    break;
            }
        } catch (err) {
            alert(err);
        }
    }
}

/**
 * Create a favorite info taking a string path or a koFileEx.
 * @param path the string path
 * @param descriptionFromPath if true create description from path otherwise is null
 * @param koFileEx used to obtain path
 * @param isDirectory used with koFileEx to determine if must be extracted
 * directory of file path
 */
FavoriteInfo.createInfo = function(path, descriptionFromPath, koFileEx, isDirectory) {
    var favPath = null;
    var type;
    var favoriteInfo = null;

    if (koFileEx) {
        if (isDirectory) {
            if (koFileEx.isRemoteFile) {
                // Remove file name from display path
                // I hope every remote path uses Unix separators
                favPath = koFileEx.displayPath.replace(/\/[^/]*$/, "");
                type = FAVORITE_REMOTE_DIR;
            } else {
                favPath = koFileEx.dirName;
                type = FAVORITE_DIR;
            }
        } else {
            favPath = koFileEx.displayPath;
            type = koFileEx.isRemoteFile ? FAVORITE_REMOTE_FILE : FAVORITE_FILE;
        }
    } else if (path) {
        favPath = path;
    } else {
        alert("Error: Both koFileEx and path are not set");
    }

    if (favPath) {
        var description = descriptionFromPath ? favPath.replace(/^.*(\/|\\)/, "") : null;
        favoriteInfo = new FavoriteInfo(favPath, type, description);
    }
    return favoriteInfo;
}

FavoriteInfo.pathSvc = Components.classes["@activestate.com/koOsPath;1"]
            .getService(Components.interfaces.koIOsPath);

/**
 * Return the index of path, -1 if path isn't present
 * @favoriteInfoArr the array containing favoriteInfo objects
 * @path the string path to search
 */
FavoriteInfo.indexOfPath = function(favoriteInfoArr, path) {
    for (var i = 0; i < favoriteInfoArr.length; i++) {
        if (FavoriteInfo.pathSvc.samepath(favoriteInfoArr[i].path, path)) {
            return i;
        }
    }
    return -1;
}