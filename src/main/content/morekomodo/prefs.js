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

function MoreKomodoPrefs() {
    this._prefBranch = Components.classes["@mozilla.org/preferences-service;1"]
        .getService(Components.interfaces.nsIPrefService)
        .getBranch("dafizilla.morokomodo.");
    this._prefBranch.QueryInterface(Components.interfaces.nsIPrefBranch2);

    this._rdf = Components.classes["@mozilla.org/rdf/rdf-service;1"]
                        .getService(Components.interfaces.nsIRDFService);
    this._rootRes = this._rdf.GetResource("urn:dafizilla:root");
    this._favoriteRes = this._rdf.GetResource("http://dafizilla.sourceforge.net/rdf#favorite");
    this._pathRes = this._rdf.GetResource("http://dafizilla.sourceforge.net/rdf#path");
    this._nameRes = this._rdf.GetResource("http://dafizilla.sourceforge.net/rdf#name");
    this._typeRes = this._rdf.GetResource("http://dafizilla.sourceforge.net/rdf#type");
    this._descriptionRes = this._rdf.GetResource("http://dafizilla.sourceforge.net/rdf#description");
    this._maxFavoriteMenuItemsRes = this._rdf.GetResource("http://dafizilla.sourceforge.net/rdf#maxFavoriteMenuItems");

    this._fileTimeRes = this._rdf.GetResource("http://dafizilla.sourceforge.net/rdf#fileTime");
    this._enabledRes = this._rdf.GetResource("http://dafizilla.sourceforge.net/rdf#enabled");
    this._timeFormatRes = this._rdf.GetResource("http://dafizilla.sourceforge.net/rdf#timeFormat");

    this._openFoundFileRes = this._rdf.GetResource("http://dafizilla.sourceforge.net/rdf#openFoundFiles");
    this._minOpenFileCount = this._rdf.GetResource("http://dafizilla.sourceforge.net/rdf#minOpenFileCount");

    this._refreshHistoryRes = this._rdf.GetResource("http://dafizilla.sourceforge.net/rdf#refreshHistory");
    this._maxRefreshHistoryEntries = this._rdf.GetResource("http://dafizilla.sourceforge.net/rdf#maxEntries");

    this._trueLiteral = this._rdf.GetLiteral("true");
    this._falseLiteral = this._rdf.GetLiteral("false");

    this._findReplaceRes = this._rdf.GetResource("http://dafizilla.sourceforge.net/rdf#findReplaceFavorite");
}

MoreKomodoPrefs.prototype = {
    getString : function(prefName, defValue) {
        var prefValue;
        try {
            prefValue = this._prefBranch.getCharPref(prefName);
        } catch (ex) {
            prefValue = null;
        }
        return prefValue == null ? defValue : prefValue;
    },

    setString : function(prefName, prefValue) {
        this._prefBranch.setCharPref(prefName, prefValue);
    },

    getBool : function(prefName, defValue) {
        var prefValue = false;
        try {
            prefValue = this._prefBranch.getBoolPref(prefName);
        } catch (ex) {
            if (defValue != undefined) {
                prefValue = defValue;
            }
        }

        return prefValue;
    },

    setBool : function(prefName, prefValue) {
        this._prefBranch.setBoolPref(prefName, prefValue);
    },

    get configPath() {
        var configPath = this.getString("configPath", null);
        if (configPath == null) {
            var f = MoreKomodoCommon.getProfileDir();
            f.append("morekomodo.rdf");
            configPath = f.path;
            this.setString("configPath", configPath);
        }
        return configPath;
    },

    /**
     * Read the favorites, returns FavoriteInfo array.
     * @returns favoriteInfo array
     */
    readFavorites : function() {
        var filePath = MoreKomodoCommon.makeFileURL(this.configPath).spec;
        var ds = this._rdf.GetDataSourceBlocking(filePath);

        var pathEnum = ds.GetTargets(this._favoriteRes, this._pathRes, true);
        var paths = [];

        while (pathEnum.hasMoreElements()) {
            var pathNode = pathEnum.getNext();
            var fi = new FavoriteInfo();

            try {
                var pathProp = pathNode
                    .QueryInterface(Components.interfaces.nsIRDFResource);
                var path = this._readLiteral(ds, pathProp, this._nameRes);
                var type = this._readLiteral(ds, pathProp, this._typeRes);
                fi.description = this._readLiteral(ds, pathProp, this._descriptionRes);
                fi.setPath(path, type);
            } catch (err) {
                // old versions use nsIRDFLiteral
                var path = pathNode
                    .QueryInterface(Components.interfaces.nsIRDFLiteral).Value;
                fi.setPath(path);
            }
            paths.push(fi);
        }
        return paths;
    },

    /**
     * Write favorites.
     * @param favoriteInfoArr array
     */
    writeFavorites : function(favoriteInfoArr) {
        var filePath = MoreKomodoCommon.makeFileURL(this.configPath).spec;
        var ds = this._rdf.GetDataSourceBlocking(filePath);

        var pathEnum = ds.GetTargets(this._favoriteRes, this._pathRes, true);

        // remove all previous favorites
        while (pathEnum.hasMoreElements()) {
            var pathNode = pathEnum.getNext();

            try {
                // old versions use nsIRDFLiteral so we now check
                // if we can remove new structure
                pathNode.QueryInterface(Components.interfaces.nsIRDFResource);
                this.removeBySubject(ds, pathNode);
            } catch (err) {
            }
            ds.Unassert(this._favoriteRes, this._pathRes, pathNode);
        }

        ds.Assert(this._rootRes, this._favoriteRes, this._pathRes, true);

        for (var i = 0;  i < favoriteInfoArr.length; i++) {
            var favoriteInfo = favoriteInfoArr[i];
            var infoRes = this._rdf.GetAnonymousResource();
            var name = this._rdf.GetLiteral(favoriteInfo.path);
            ds.Assert(infoRes, this._nameRes, name, true);

            if (favoriteInfo.description != "") {
                var description = this._rdf.GetLiteral(favoriteInfo.description);
                ds.Assert(infoRes, this._descriptionRes, description, true);
            }

            if (favoriteInfo.isRemote()) {
                var typeLiteral = this._rdf.GetLiteral(favoriteInfo.type);
                ds.Assert(infoRes, this._typeRes, typeLiteral, true);
            }
            ds.Assert(this._favoriteRes, this._pathRes, infoRes, true);
        }

        ds.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
        ds.Flush();
    },

    readMaxFavoriteMenuItems : function() {
        var filePath = MoreKomodoCommon.makeFileURL(this.configPath).spec;
        var ds = this._rdf.GetDataSourceBlocking(filePath);

        return this._readLiteral(ds,
                            this._favoriteRes, this._maxFavoriteMenuItemsRes,
                            -1);
    },

    writeMaxFavoriteMenuItems : function(maxItems) {
        maxItems = new Number(maxItems);
        if (isNaN(maxItems) || maxItems < 0) {
            maxItems = -1;
        }
        var maxItemsLiteral = this._rdf.GetLiteral(maxItems);

        var filePath = MoreKomodoCommon.makeFileURL(this.configPath).spec;
        var ds = this._rdf.GetDataSourceBlocking(filePath);

        this._setProperty(ds, this._favoriteRes, this._maxFavoriteMenuItemsRes, maxItemsLiteral);

        ds.Assert(this._rootRes, this._favoriteRes, this._maxFavoriteMenuItemsRes, true);
        ds.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
        ds.Flush();
    },

    /**
     * Remove all nodes using passed subjectRes
     */
    removeBySubject : function(ds, subjectRes) {
        var e = ds.ArcLabelsOut(subjectRes);

        while (e.hasMoreElements()) {
            var predicateNode = e.getNext();
            var objEnum = ds.GetTargets(subjectRes, predicateNode, true);

            while (objEnum.hasMoreElements()) {
                var objectNode = objEnum.getNext();
                ds.Unassert(subjectRes, predicateNode, objectNode);
            }
        }
    },

    getDefaultTimeFormat : function() {
        return "%d/%m/%Y %H:%M.%S";
    },

    getDefaultMinOpenFileCount : function() {
        return 3;
    },

    readFileTimeInfo : function() {
        var filePath = MoreKomodoCommon.makeFileURL(this.configPath).spec;
        var ds = this._rdf.GetDataSourceBlocking(filePath);
        var fileTimeInfo = {};

        fileTimeInfo.isEnabled = "true" == this._readLiteral(ds,
                            this._fileTimeRes, this._enabledRes, "true");
        fileTimeInfo.timeFormat = this._readLiteral(ds,
                            this._fileTimeRes, this._timeFormatRes,
                            this.getDefaultTimeFormat());
        return fileTimeInfo;
    },

    writeFileTimeInfo : function(fileTimeInfo) {
        var timeFormat = fileTimeInfo.timeFormat;
        if (timeFormat == "") {
            timeFormat = this.getDefaultTimeFormat();
        }
        var timeFormatLiteral = this._rdf.GetLiteral(timeFormat);

        var filePath = MoreKomodoCommon.makeFileURL(this.configPath).spec;
        var ds = this._rdf.GetDataSourceBlocking(filePath);

        this._setProperty(ds, this._fileTimeRes, this._enabledRes,
                          this._getLiteralBoolean(fileTimeInfo.isEnabled));
        this._setProperty(ds, this._fileTimeRes, this._timeFormatRes, timeFormatLiteral);

        ds.Assert(this._rootRes, this._fileTimeRes, this._enabledRes, true);
        ds.Assert(this._rootRes, this._fileTimeRes, this._timeFormatRes, true);
        ds.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
        ds.Flush();
    },

    readOpenFoundFileInfo : function() {
        var filePath = MoreKomodoCommon.makeFileURL(this.configPath).spec;
        var ds = this._rdf.GetDataSourceBlocking(filePath);
        var openFoundFileInfo = {};

        openFoundFileInfo.minFileCount = this._readLiteral(ds,
                            this._openFoundFileRes, this._minOpenFileCount,
                            this.getDefaultMinOpenFileCount());
        return openFoundFileInfo;
    },

    writeOpenFoundFileInfo : function(openFoundFileInfo) {
        var minFileCount = new Number(openFoundFileInfo.minFileCount);
        if (isNaN(minFileCount) || minFileCount < 0) {
            minFileCount = this.getDefaultMinOpenFileCount();
        }
        var minFileCountLiteral = this._rdf.GetLiteral(minFileCount);

        var filePath = MoreKomodoCommon.makeFileURL(this.configPath).spec;
        var ds = this._rdf.GetDataSourceBlocking(filePath);

        this._setProperty(ds, this._openFoundFileRes, this._minOpenFileCount, minFileCountLiteral);

        ds.Assert(this._rootRes, this._openFoundFileRes, this._minOpenFileCount, true);
        ds.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
        ds.Flush();
    },

    getDefaultMaxRefreshHistoryEntries : function() {
        return 5;
    },

    readMaxRefreshHistoryEntries : function() {
        var filePath = MoreKomodoCommon.makeFileURL(this.configPath).spec;
        var ds = this._rdf.GetDataSourceBlocking(filePath);

        return this._readLiteral(ds,
                            this._refreshHistoryRes,
                            this._maxRefreshHistoryEntries,
                            this.getDefaultMaxRefreshHistoryEntries());
    },

    writeMaxRefreshHistoryEntries : function(maxEntries) {
        maxEntries = new Number(maxEntries);
        if (isNaN(maxEntries) || maxEntries < 0) {
            maxEntries = this.getDefaultMaxRefreshHistoryEntries();
        }
        var maxEntriesLiteral = this._rdf.GetLiteral(maxEntries);

        var filePath = MoreKomodoCommon.makeFileURL(this.configPath).spec;
        var ds = this._rdf.GetDataSourceBlocking(filePath);

        this._setProperty(ds, this._refreshHistoryRes, this._maxRefreshHistoryEntries, maxEntriesLiteral);

        ds.Assert(this._rootRes, this._refreshHistoryRes, this._maxRefreshHistoryEntries, true);
        ds.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
        ds.Flush();
    },

    _readLiteral : function(ds, source, property, defaultValue) {
        var value = ds.GetTarget(source, property, true);

        if (value == null) {
            return defaultValue;
        }
        return value.QueryInterface(Components.interfaces.nsIRDFLiteral).Value;
    },

    _getLiteralBoolean : function(value) {
        return value ? this._trueLiteral : this._falseLiteral;
    },

    _setProperty : function(ds, source, property, newValue) {
        var oldValue = ds.GetTarget(source, property, true);
        if (oldValue) {
            if (newValue) {
                ds.Change(source, property, oldValue, newValue);
            } else {
                ds.Unassert(source, property, oldValue);
            }
        } else if (newValue) {
            ds.Assert(source, property, newValue, true);
        }
   },

    /**
     * Read the find replace favorites, returns FavoriteInfo array.
     * @returns favoriteInfo array
     */
    readFindReplaceFavorites : function() {
        var filePath = MoreKomodoCommon.makeFileURL(this.configPath).spec;
        var ds = this._rdf.GetDataSourceBlocking(filePath);

        var pathEnum = ds.GetTargets(this._findReplaceRes, this._nameRes, true);
        var paths = [];

        var boolProperties = [
            "optRegex",
            "optCase",
            "optWord",
            "optMultiline",
            "optReplace",
            "optConfirmReplacementsInFiles",
            "optShowReplaceAllResults",
            "optSearchInSubdirs"];
        
        var stringProperties = [
            "optCaseValue",
            "searchIn",
            "name",
            "searchPattern",
            "replacePattern",
            "multilineSearchPattern",
            "multilineReplacePattern",
            "dirs",
            "includes",
            "excludes"];

        while (pathEnum.hasMoreElements()) {
            var pathNode = pathEnum.getNext();
            var fi = {};

            try {
                var pathProp = pathNode
                    .QueryInterface(Components.interfaces.nsIRDFResource);
                for (i in boolProperties) {
                    var property = boolProperties[i];
                    var res = this._rdf.GetResource(
                        "http://dafizilla.sourceforge.net/rdf#" + property);
                     var value = this._readLiteral(ds, pathProp, res);
                     fi[property] = value == "true";
                }

                for (i in stringProperties) {
                    var property = stringProperties[i];
                    var res = this._rdf.GetResource(
                        "http://dafizilla.sourceforge.net/rdf#" + property);
                     var value = this._readLiteral(ds, pathProp, res);
                     fi[property] = value;
                }
            } catch (err) {
            }
            paths.push(fi);
        }
        return paths;
    },

    /**
     * Write find replace favorites.
     * @param favoriteInfoArr array
     */
    writeFindReplaceFavorites : function(favoriteInfoArr) {
        var filePath = MoreKomodoCommon.makeFileURL(this.configPath).spec;
        var ds = this._rdf.GetDataSourceBlocking(filePath);

        var pathEnum = ds.GetTargets(this._findReplaceRes, this._nameRes, true);

        // remove all previous favorites
        while (pathEnum.hasMoreElements()) {
            var pathNode = pathEnum.getNext();

            try {
                // old versions use nsIRDFLiteral so we now check
                // if we can remove new structure
                pathNode.QueryInterface(Components.interfaces.nsIRDFResource);
                this.removeBySubject(ds, pathNode);
            } catch (err) {
            }
            ds.Unassert(this._findReplaceRes, this._nameRes, pathNode);
        }

        ds.Assert(this._rootRes, this._favoriteRes, this._nameRes, true);

        for (var i = 0;  i < favoriteInfoArr.length; i++) {
            var favoriteInfo = favoriteInfoArr[i];
            var infoRes = this._rdf.GetAnonymousResource();

            for (prop in favoriteInfo) {
                var res = this._rdf.GetResource("http://dafizilla.sourceforge.net/rdf#" + prop);
                ds.Assert(infoRes, res, this._rdf.GetLiteral(favoriteInfo[prop]), true);
            }

            ds.Assert(this._findReplaceRes, this._nameRes, infoRes, true);
        }

        ds.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
        ds.Flush();
    },

    get useLastFindContext() {
        return this.getBool("useLastFindContext", true);
    },

    set useLastFindContext(value) {
        this.setBool("useLastFindContext", value);
    },

    get lastFindContext() {
        return this.getString("lastFindContext", "");
    },

    set lastFindContext(value) {
        this.setString("lastFindContext", value);
    }
};