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
MoreKomodoCommon.locale = Components.classes["@mozilla.org/intl/stringbundle;1"]
    .getService(Components.interfaces.nsIStringBundleService)
    .createBundle("chrome://morekomodo/locale/morekomodo.properties");

function MoreKomodoCommon() {
    return this;
}

MoreKomodoCommon.makeLocalFile = function(path, arrayAppendPaths) {
    var file;

    try {
        file = path.QueryInterface(Components.interfaces.nsILocalFile);
    } catch (err) {
        file = Components.classes["@mozilla.org/file/local;1"]
               .createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(path);
    }

    if (arrayAppendPaths != null
        && arrayAppendPaths != undefined
        && arrayAppendPaths.length) {
        for (var i = 0; i < arrayAppendPaths.length; i++) {
            file.append(arrayAppendPaths[i]);
        }
    }
    return file;
}

MoreKomodoCommon.getLocalizedMessage = function(msg) {
    return MoreKomodoCommon.locale.GetStringFromName(msg);
}

MoreKomodoCommon.getFormattedMessage = function(msg, ar) {
    return MoreKomodoCommon.locale.formatStringFromName(msg, ar, ar.length);
}

MoreKomodoCommon.makeFilePicker = function(win, title, mode, displayDirectory) {
    const nsIFilePicker                 = Components.interfaces.nsIFilePicker;
    const CONTRACTID_FILE_PICKER        = "@mozilla.org/filepicker;1";
    
    if (mode == null || mode == undefined) {
        mode = nsIFilePicker.modeOpen;
    }
    var fp = Components.classes[CONTRACTID_FILE_PICKER]
                .createInstance(nsIFilePicker);
    fp.init(win, title, mode);
    if (displayDirectory) {
        fp.displayDirectory = displayDirectory;
    }
    
    return fp;
}

MoreKomodoCommon.getProfileDir = function() {
    return MoreKomodoCommon.getPrefDir("PrefD");
}

MoreKomodoCommon.getUserHome = function() {
    return MoreKomodoCommon.getPrefDir("Home");
}

MoreKomodoCommon.getPrefDir = function(dir) {
    const CONTRACTID_DIR = "@mozilla.org/file/directory_service;1";
    const nsDir = Components.interfaces.nsIProperties;

    var dirService = Components.classes[CONTRACTID_DIR].getService(nsDir);
    return dirService.get(dir, Components.interfaces.nsILocalFile);
}

MoreKomodoCommon.makeFileURL = function(aFile) {
    var theFile = MoreKomodoCommon.makeLocalFile(aFile);

    var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                    .getService(Components.interfaces.nsIIOService);
    return ioService.newFileURI(theFile);
}

    
MoreKomodoCommon.copyToClipboard = function(str) {
    Components.classes["@mozilla.org/widget/clipboardhelper;1"]
        .getService(Components.interfaces.nsIClipboardHelper)
        .copyString(str);
}

MoreKomodoCommon.changeUriView = function(view, uri) {
    var docSvc = Components
        .classes["@activestate.com/koDocumentService;1"]
        .getService(Components.interfaces.koIDocumentService);
    var newDoc = docSvc.createDocumentFromURI(uri);
    // Otherwise it's initially loaded as an empty document
    newDoc.load();
    view.document = newDoc;
}

MoreKomodoCommon.renameFile = function(uri, newName) {
    function canRename(isFile, newName) {
        if (isFile) {
            var msgConfirmRename = MoreKomodoCommon
                    .getFormattedMessage("rename.confirm", [newName]);
            return ko.dialogs.yesNo(msgConfirmRename, "No") == "Yes";
        }
        var errInvalidFile = MoreKomodoCommon
            .getFormattedMessage("rename.err.invalid.file", [newName]);
        ko.dialogs.alert(errInvalidFile);
        return false;
    }

    var koFileEx = MoreKomodoCommon.makeIFileExFromURI(uri);
    var oldPath = koFileEx.path;
    var newPath = null;

    if (koFileEx.isRemoteFile) {
        var rcSvc = Components
                    .classes["@activestate.com/koRemoteConnectionService;1"]
                    .getService(Components.interfaces.koIRemoteConnectionService);
        var conn = rcSvc.getConnectionUsingUri(uri);
        var parent = conn.getParentPath(oldPath);

        var newFile = conn.list(newName, 1);
        var exists = newFile != null;
        if (!exists || canRename(newFile.isFile(), newName)) {
            newPath = parent + "/" + newName;
            conn.rename(oldPath, newPath);
        }
    } else if (koFileEx.isFile) {
        var oldLocalFile = MoreKomodoCommon.makeLocalFile(oldPath);
        var newLocalFile = MoreKomodoCommon.makeLocalFile(oldLocalFile.parent, [newName]);
        if (!newLocalFile.exists() || canRename(newLocalFile.isFile(), newName)) {
            newPath = newLocalFile.path;
            oldLocalFile.moveTo(null, newName);
        }
    }

    return newPath;
}

MoreKomodoCommon.deleteFile = function(uri) {
    var koFileEx = MoreKomodoCommon.makeIFileExFromURI(uri);
    var path = koFileEx.path;

    if (koFileEx.isRemoteFile) {
        var rcSvc = Components
                    .classes["@activestate.com/koRemoteConnectionService;1"]
                    .getService(Components.interfaces.koIRemoteConnectionService);
        var conn = rcSvc.getConnectionUsingUri(uri);
        conn.removeFile(path);
    } else {
        MoreKomodoCommon.makeLocalFile(path).remove(false);
    }
}

MoreKomodoCommon.isRemotePath = function(ko, path) {
    try {
        ko.uriparse.localPathToURI(path);
    } catch (err) {
        return true;
    }
    return false;
}

MoreKomodoCommon.getObserverService = function () {
    const CONTRACTID_OBSERVER = "@mozilla.org/observer-service;1";
    const nsObserverService = Components.interfaces.nsIObserverService;

    return Components.classes[CONTRACTID_OBSERVER].getService(nsObserverService);
}

MoreKomodoCommon.makeIFileExFromURI = function (uri) {
    var file = Components
                    .classes["@activestate.com/koFileEx;1"]
                    .createInstance(Components.interfaces.koIFileEx);
    file.path = uri;
    
    return file;
}

MoreKomodoCommon.clone = function(obj, shallow) {
    if (obj == null || typeof(obj) != 'object') {
        return obj;
    }
    var cloned = {};
    
    for(var i in obj) {
        if (shallow) {
            cloned[i] = obj[i];
        } else {
            cloned[i] = MoreKomodoCommon.clone(obj[i], shallow);
        }
    }
    return cloned;
}

MoreKomodoCommon.getHtmlFromClipboard = function() {
    var clipboard  = Components.classes["@mozilla.org/widget/clipboard;1"]
                        .getService(Components.interfaces.nsIClipboard);
    var xferable = Components.classes["@mozilla.org/widget/transferable;1"]
                        .createInstance(Components.interfaces.nsITransferable);
    pastedText = null;
    if (clipboard && xferable) {
        xferable.addDataFlavor("text/html");
    
        clipboard.getData(xferable, clipboard.kGlobalClipboard);

        var str       = new Object();
        var strLength = new Object();
    
        xferable.getTransferData("text/html", str, strLength);
        if (str) {
            str = str.value.QueryInterface(Components.interfaces.nsISupportsString);
        }
        if (str) {
            pastedText = str.data.substring(0, strLength.value / 2);
        }
    }
    return pastedText;
}

MoreKomodoCommon.pasteFromClipboard = function() {
    var clipboard  = Components.classes["@mozilla.org/widget/clipboard;1"]
                        .getService(Components.interfaces.nsIClipboard);
    var xferable = Components.classes["@mozilla.org/widget/transferable;1"]
                        .createInstance(Components.interfaces.nsITransferable);
    pastedText = null;
    if (clipboard && xferable) {
        xferable.addDataFlavor("text/unicode");
    
        clipboard.getData(xferable, clipboard.kGlobalClipboard);

        var str       = new Object();
        var strLength = new Object();
    
        xferable.getTransferData("text/unicode", str, strLength);
        if (str) {
            str = str.value.QueryInterface(Components.interfaces.nsISupportsString);
        }
        if (str) {
            pastedText = str.data.substring(0, strLength.value / 2);
        }
    }
    return pastedText;
}

MoreKomodoCommon.hasClipboardHtml = function() {
    return MoreKomodoCommon.hasDataMatchingFlavors(["text/html"]);
}

MoreKomodoCommon.hasDataMatchingFlavors = function(flavors) {
    const kClipboardIID = Components.interfaces.nsIClipboard;
    var clipboard  = Components.classes["@mozilla.org/widget/clipboard;1"]
                        .getService(Components.interfaces.nsIClipboard);

    if (kClipboardIID.number == "{8b5314ba-db01-11d2-96ce-0060b0fb9956}") {
        var flavorArray = Components.classes["@mozilla.org/supports-array;1"]
            .createInstance(Components.interfaces.nsISupportsArray);

        for (var i = 0; i < flavors.length; ++i) {
            var kSuppString = Components.classes["@mozilla.org/supports-cstring;1"]
                           .createInstance(Components.interfaces.nsISupportsCString);
            kSuppString.data = flavors[i];
            flavorArray.AppendElement(kSuppString);
        }        
        return clipboard.hasDataMatchingFlavors(flavorArray, clipboard.kGlobalClipboard);
    } else {
        return clipboard.hasDataMatchingFlavors(flavors, flavors.length,
                                                kClipboardIID.kGlobalClipboard);
    }
}

MoreKomodoCommon.removeMenuItems = function(menu) {
    var children = menu.childNodes;

    for (var i = children.length - 1; i >= 0; i--) {
        menu.removeChild(children[i]);
    }
}

MoreKomodoCommon.log = function(msg) {
    ko.logging.getLogger("extensions.morekomodo").warn(msg);
}

MoreKomodoCommon.backupFile = function(fromFile, toFile) {
    var lastModifiedTime = fromFile.lastModifiedTime;
    
    if (toFile.exists()) {
        toFile.remove(false);
    }
    fromFile.copyTo(toFile.parent, toFile.leafName);
    // preserve original file time
    toFile.lastModifiedTime = lastModifiedTime;
}