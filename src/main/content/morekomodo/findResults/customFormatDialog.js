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
var gCustomFormatDialog = {
    onLoad : function() {
        try {
            this.param = window.arguments[0];
            this.format = "";
            this.checks = [];
            this.sample = [];

            this.initControls();
        } catch (err) {
            alert(err);
        }
    },

    initControls : function() {
        this.checks = [document.getElementById("line-number"),
            document.getElementById("file-path"),
            document.getElementById("content")];

        var self = this;
        this.handle_checkboxStateChange = function(event) {
            self.onToggleCheckbox(event);
        }

        for (var i in this.checks) {
            this.checks[i].addEventListener("CheckboxStateChange",
                            this.handle_checkboxStateChange, false);
        }
        
        this.sampleOutputWidget = document.getElementById("sample-output");
        this.acceptWidget = document.documentElement.getButton("accept");
        this.initValues();
    },

    initValues : function() {
        if ((/^Win/).exec(window.navigator.platform)) {
            this.sample[moreKomodoFindResultsUtil.FILE_PATH] = "C:\\LOREM.TXT";
        } else {
            this.sample[moreKomodoFindResultsUtil.FILE_PATH] = "/home/dave/lorem.txt";
        }
        this.sample[moreKomodoFindResultsUtil.LINE_NUMBER] = "25";
        this.sample[moreKomodoFindResultsUtil.CONTENT] = "Lorem ipsum dolor sit amet";

        for (var i = 0; i < this.param.format.length; i++) {
            var checkbox = this.checks[parseInt(this.param.format[i])];
            if (checkbox) {
                checkbox.checked = true;
            }
        }
        // at startup accept button is disabled
        this.acceptWidget.disabled = this.format == "";
    },

    onAccept : function() {
        this.param.isOk = true;
        this.param.format = this.format;
        return true;
    },

    onCancel : function() {
        this.param.isOk = false;
    },

    setFormatByCheckBox : function(checkbox) {
        var value = checkbox.getAttribute("value");

        if (checkbox.checked) {
            this.format += value;
        } else {
            this.format = this.format.replace(value, "");
        }
    },

    updateSampleOutput : function() {
        var s = [];

        for (var i = 0; i < this.format.length; i++) {
            s.push(this.sample[parseInt(this.format[i])]);
        }
        this.sampleOutputWidget.value = s.join(String.fromCharCode(187));
    },

    onToggleCheckbox : function(event) {
        this.setFormatByCheckBox(event.target);
        this.updateSampleOutput();
        this.acceptWidget.disabled = this.format == "";
    }
}
