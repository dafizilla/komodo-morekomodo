var gHexDumpDialog = {
    onLoad : function() {
        this.widget = {};
        this.widget.accept = document.documentElement.getButton("accept");
        this.widget.filePath = document.getElementById('file-path');
        this.widget.bytesPerRow = document.getElementById('bytes-per-row');
        this.widget.isRemoteFile = document.getElementById('use-remote-file');

        this.widget.accept.setAttribute('disabled', 'true');
    },

    onAccept : function() {
        try {
            var filePath = this.widget.filePath.value;

            if (filePath) {
                var bytesPerRow = parseInt(this.widget.bytesPerRow.value, 10);
                var fileName = MoreKomodoCommon.makeIFileExFromURI(filePath).baseName;
                var views = ko.windowManager.getMainWindow().ko.views;
                var hexArr = morekomodo.hexDump.dumpFile(filePath, bytesPerRow);

                var appendHexDumpToView = function(view) {
                    view.document.baseName = 'Hex dump for "' + fileName + '"';
                    view.parentView.updateLeafName(view);
                    hexArr.push("") // add an empty line
                    var hexDump = hexArr.join('\n');
                    view.scintilla.scimoz.replaceSel(hexDump);
                    view.scimoz.gotoPos(0);
                };

                // Since Komodo 5.0.3 doNewView is deprecated
                // http://www.openkomodo.com/blogs/toddw/komodo-5-0-3-api-changes
                if (typeof(views.manager.doNewViewAsync) == "undefined") {
                    appendHexDumpToView(views.manager.doNewView());
                } else {
                    views.manager.doNewViewAsync("Text", null, appendHexDumpToView);
                }
            }
        } catch (ex) {
            alert(ex);
        }

        return true;
    },

    onFilePick : function() {
        if (this.widget.isRemoteFile.checked) {
            var result = ko.filepicker.remoteFileBrowser();
            if (result && result.filepaths.length > 0) {
                this.widget.filePath.value = result.filepaths[0];
            }
        } else {
            this.widget.filePath.value = ko.filepicker.openFile();
        }
        this.widget.accept.setAttribute('disabled',
                                this.widget.filePath.value ? 'false' : 'true');
    }
};