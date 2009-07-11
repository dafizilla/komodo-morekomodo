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
var findInFilesWidgetsInitializer = {
    findContextMap : {
        "curr-project" : document.getElementById("search-in-curr-project"),
        "files" : document.getElementById("search-in-files")
            || document.getElementsByAttribute("value", "files").item(0),
        "collection" : document.getElementById("search-in-collection")},

    onLoad : function(event) {
        this.prefs = new MoreKomodoPrefs();
        this.initControls();
    },

    onUnload : function(event) {
        if ((this.searchIn.value in this.findContextMap)
            && this.prefs.useLastFindContext) {
            this.prefs.lastFindContext = this.searchIn.value;
        }
    },

    initControls: function() {
        this.searchIn = document.getElementById('search-in-menu');

        this.setLastFindInFiles();
    },

    setLastFindInFiles : function() {
        if ((this.searchIn.value in this.findContextMap)
            && this.prefs.useLastFindContext) {
            var lastFindContext = this.prefs.lastFindContext;
            var context = this.findContextMap[lastFindContext];

            if (typeof (context) != "undefined"
                && context && !context.hasAttribute("hidden")) {
                this.searchIn.value = lastFindContext;
                this.searchIn.doCommand();
            }
        }
    }
}

window.addEventListener("load", function(event) { findInFilesWidgetsInitializer.onLoad(event); }, false);
window.addEventListener("unload", function(event) { findInFilesWidgetsInitializer.onUnload(event); }, false);
