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
var prefs = new MoreKomodoPrefs();
var oShowStatusbar;
var oTimeFormat;
var fileTimeInfo;

function onCheckShowStatusbar() {
    var disabled = !oShowStatusbar.checked;
    oTimeFormat.disabled = disabled;
    oDefaultTimeFormat.disabled = disabled;
}

function onDefaultTimeFormatCommand() {
    oTimeFormat.value = prefs.getDefaultTimeFormat();
}

function OnPreferencePageOK(prefset) {
    var fileTimeInfo = {
            isEnabled : oShowStatusbar.checked,
            timeFormat : oTimeFormat.value
    };
    prefs.writeFileTimeInfo(fileTimeInfo);

    var obs = MoreKomodoCommon.getObserverService();
    obs.notifyObservers(null, "morekomodo_pref_changed", "fileTime");
    return true;
}

function OnPreferencePageInitalize(prefset) {
    oShowStatusbar = document.getElementById("showStatusbar");
    oShowStatusbar.addEventListener("CheckboxStateChange", onCheckShowStatusbar, false);

    oTimeFormat = document.getElementById("timeFormat");
    oDefaultTimeFormat = document.getElementById("defaultTimeFormat");
    fileTimeInfo = prefs.readFileTimeInfo();
}

function OnPreferencePageLoading(prefset) {
    oShowStatusbar.checked = fileTimeInfo.isEnabled;
    oTimeFormat.value = fileTimeInfo.timeFormat;
}

function fileTimeOnLoad() {
    parent.hPrefWindow.onpageload();
}
