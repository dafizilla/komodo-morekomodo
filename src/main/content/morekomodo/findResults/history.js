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
var moreKomodoFindResultsHistory = {
    treeView : null,

    init : function() {
        this.treeWidget = document.getElementById("morekomodo-findResultsHistory-tree");
        this.treeView = new moreKomodoFindResultsHistoryTreeView(this.treeWidget);
        this.disableButton = document.getElementById("morekomodo-findresults-history-disable");
    },

    saveHistory : function(tabIndex, findOptions) {
        if (this.isDisabled) {
            return;
        }
        var results = [];
        var findResultsTree = FindResultsTab_GetManager(tabIndex);
        var view = findResultsTree.view;
        var columnId = {id : "findresults" + tabIndex + "-context"};

        for (var i = 0; i < view.rowCount; i++) {
            results.push({
                url : view.GetUrl(i),
                startIndex : view.GetStartIndex(i),
                endIndex : view.GetEndIndex(i),
                value : view.GetValue(i),
                content : view.getCellText(i, columnId),
                replacement : view.GetReplacement(i),
                lineNum : view.GetLineNum(i),
                columnNum : view.GetColumnNum(i)
            });
        }

        if (results.length) {
            var findInfo = {
                    options : {},
                    context: findResultsTree.context_,
                    pattern : findResultsTree._pattern
                    };
            moreKomodoFindResultsUtil.copyFindOptions(
                    findOptions,
                    findInfo.options)
            var label = this.buildLabel(findInfo);
            this.treeView.addItem(label, results);
        }
    },

    buildLabel : function(findInfo) {
        var options = findInfo.options;
        var args = new Array(moreKomodoFindResultsUtil
                                .createLabelFromFindInfo(findInfo));
        var message;

        switch (findInfo.context.type) {
            case Components.interfaces.koIFindContext.FCT_CURRENT_DOC:
                message = "findresults.history.current.document";
                break;
            case Components.interfaces.koIFindContext.FCT_SELECTION:
                message = "findresults.history.selection";
                break;
            case Components.interfaces.koIFindContext.FCT_ALL_OPEN_DOCS:
                message = "findresults.history.open.documents";
                break;
            case Components.interfaces.koIFindContext.FCT_IN_FILES:
                if (options.encodedIncludeFiletypes
                    && options.encodedExcludeFiletypes) {
                    message = "findresults.history.include.exclude.files";
                    args.push(options.encodedIncludeFiletypes);
                    args.push(options.encodedExcludeFiletypes);
                } else if (options.encodedIncludeFiletypes) {
                    message = "findresults.history.include.files";
                    args.push(options.encodedIncludeFiletypes);
                } else if (options.encodedExcludeFiletypes) {
                    message = "findresults.history.exclude.files";
                    args.push(options.encodedExcludeFiletypes);
                }
                break;
            case Components.interfaces.koIFindContext.FCT_IN_COLLECTION:
                message = "findresults.history.project.files";
                break;
            default:
                MoreKomodoCommon.log(
                    "findResults history buildLabel not supported for type "
                    + findInfo.context.type);
                return "";
        }

        return MoreKomodoCommon.getFormattedMessage(message, args);
    },

    onDblClick : function(event) {
        var item = this.treeView.getSelectedItem();
        if (item && !item.isContainer) {
            this.jumpToFind(item.result);
        }
        return true;
    },

    deleteSelectedItems : function() {
        this.treeView.deleteIndexes(this.treeView.selectedRootIndexes);
    },

    get isDisabled() {
        return this.disableButton.getAttribute("off") == "true";
    },

    toggleDisableHistory : function() {
        if (this.disableButton.getAttribute("off") == "true") {
            this.disableButton.setAttribute("off", "false");
        } else {
            this.disableButton.setAttribute("off", "true");
        }
    },

    // Adapted form FindResultsTabManager.prototype._doubleClick
    jumpToFind : function(result) {
        // Jump to the find/replace result.
        try {
            //XXX Note that "url" is the current (bad) name for the view ID, which
            //    itself is poorly represented by the display path of the file. Note
            //    that this may not translate to a valid URL if the view is untitled.
            var displayPath = result.url;
            ko.open.displayPath(
                displayPath, "editor",
                function(view) {
                    var osPathSvc = Components.classes["@activestate.com/koOsPath;1"]
                            .getService(Components.interfaces.koIOsPath);
                    if (!view || !view.document ||
                        !osPathSvc.samepath(view.document.displayPath, displayPath))
                    {
                        // File wasn't opened for whatever reason.
                        return;
                    }
                    var scimoz = view.scintilla.scimoz;

                    // Try to find the match or replacement result. If it cannot be
                    // found then just go to the start of the line where it used to be.
                    // XXX Could try and be more sophisticated in the search.
                    var startCharIdx = result.startIndex;
                    var start = scimoz.positionAtChar(0, startCharIdx); // a *byte* offset
                    var endCharIdx = result.endIndex;
                    var end = scimoz.positionAtChar(0, endCharIdx); // a *byte* offset
                    var value = result.value;
                    var replacement = result.replacement;
                    // - first try the original indeces (if the file has not changed the result
                    //   should still be there)
                    //   XXX This *can* fluke to the wrong result if the buffer has changed.
                    //       The *correct* answer would be to only attempt this_ if the buffer
                    //       is identical to when the find-/replace-all was done.
                    if ((replacement && scimoz.getTextRange(start, end) == replacement)
                        || scimoz.getTextRange(start, end) == value)
                    {
                        MoreKomodoCommon.log("Jump To Find Result: found at the original indices ("+start+","+end+")\n");
                    }
                    // - next, try using the line and column number to find it again (this_ will
                    //   survive basic changes in the document that do not add or remove lines)
                    else {
                        var lineNum = result.lineNum;
                        var columnIndex = result.columnNum;
                        var lineStartIndex = scimoz.positionFromLine(lineNum-1);
                        var possibleValue = scimoz.getTextRange(lineStartIndex+columnIndex,
                                                                lineStartIndex+columnIndex
                                                                +value.length);
                        var possibleReplacement = scimoz.getTextRange(lineStartIndex+columnIndex,
                                                                      lineStartIndex+columnIndex
                                                                      +replacement.length);
                        if (replacement && possibleReplacement == replacement) {
                            start = lineStartIndex+columnIndex;
                            end = lineStartIndex+columnIndex+replacement.length;
                        } else if (possibleValue == value) {
                            start = lineStartIndex+columnIndex;
                            end = lineStartIndex+columnIndex+value.length;
                        }

                        // - next, try searching within the current line
                        //   XXX Note, this_ bails if there is more than one possible match on
                        //       the current line. This could attempt to be more intelligent,
                        //       like perhaps selecting the match that is closest to the
                        //       original column number.
                        else {
                            var lineText = scimoz.getTextRange(lineStartIndex,
                                            scimoz.getLineEndPosition(lineNum-1));
                            var valueIndex = lineText.indexOf(value);
                            var replacementIndex = lineText.indexOf(replacement);
                            if (replacement && replacementIndex != -1
                                && lineText.lastIndexOf(replacement) == replacementIndex)
                            {
                                start = lineStartIndex+replacementIndex;
                                end = lineStartIndex+replacementIndex+replacement.length;
                            } else if (valueIndex != -1
                                       && lineText.lastIndexOf(value) == valueIndex)
                            {
                                start = lineStartIndex+valueIndex;
                                end = lineStartIndex+valueIndex+value.length;
                            }

                            // - XXX next, could try to search a couple lines above and below
                            //   but for now will just give up
                            else {
                                //XXX This ends up on the first line if this_ line is now off
                                //    the bottom. This should instead go to the LAST line.
                                start = lineStartIndex
                                end = lineStartIndex;

                                // Let the user know about the problem on the status bar.
                                ko.statusBar.AddMessage(
                                    "The specified text has been moved or deleted.", "find",
                                    3000, true);
                            }
                        }
                    }

                    // Make the modifications in a timeout to avoid unwanted horizontal
                    // scroll (bug 60117).
                    // XXX - This may no longer be necessary since this is using an
                    //       callback from an asynchronous function (if new view).
                    setTimeout(function() {
                        scimoz.setSel(start, end);
                        scimoz.chooseCaretX();
                        view.setFocus();
                    } , 0);
                }
            );
        } catch (ex) {
            MoreKomodoCommon.log(ex);
        }
    },

    onTreeKeyPress : function(event) {
        if (event.ctrlKey) {
            var key = String.fromCharCode(event.which).toLowerCase();
            if (key == 'a') {
                var selection = this.treeView.selection;

                selection.rangedSelect(0, this.treeView.rowCount - 1, true);
            }
        }
    }
}

function moreKomodoFindResultsHistoryTreeView(treeWidget) {
    this.itemsMap = [];
    this.visibleItems = [];

    this.treebox = null;
    this.selection = null;

    treeWidget.view = this;
    this.refresh();
}

moreKomodoFindResultsHistoryTreeView.prototype = {
    addItem : function(label, results) {
        var historyItem = {
            label : label,
            isContainer : true,
            isOpen : false
        }
        this.itemsMap[label] = results;
        this.visibleItems.push(historyItem);
        this.treebox.rowCountChanged(this.rowCount + 1, 1);
        this.refresh();
    },

    invalidate : function() {
        this.treebox.invalidate();
    },

    refresh : function() {
        this.selection.clearSelection();
        this.selection.select(0);
        this.treebox.invalidate();
        this.treebox.ensureRowIsVisible(0);
    },

    getSelectedItem : function() {
        var fromIdx = this.selection.currentIndex;

        if (fromIdx >= 0) {
            return this.visibleItems[fromIdx];
        }
        return null;
    },

    get selectedRootIndexes() {
        var selection = this.selection;
        var items = [];

        if (this.rowCount) {
            for (var i = 0; i < selection.getRangeCount(); i++) {
                var minIdx = {};
                var maxIdx = {};
                selection.getRangeAt(i, minIdx, maxIdx);
                for (var selIdx = minIdx.value; selIdx <= maxIdx.value; selIdx++) {
                    if (this.isContainer(selIdx)) {
                        items.push(selIdx);
                    }
                }
            }
        }

        return items;
    },

    deleteIndexes : function(indexes) {
        if (indexes && indexes.length > 0) {
            for (var i = indexes.length - 1; i >= 0; i--) {
                var index = indexes[i];
                if (this.isContainer(index) && this.isContainerOpen(index)) {
                    this.toggleOpenState(index);
                }
                this.visibleItems.splice(index, 1);
            }
            this.treebox.rowCountChanged(indexes[0], -indexes.length);
        }
    },

    getCellText : function(row, column){
        var item = this.visibleItems[row];

        switch (column.id) {
            case "morekomodo-findResultsHistoryUrl":
                return item.isContainer ? item.label : item.result.url;
            case "morekomodo-findResultsHistoryLine":
                return item.isContainer ? "" : item.result.lineNum;
            case "morekomodo-findResultsHistoryContent":
                return item.isContainer ? "" : item.result.content;
        }
        return item.label;
    },

    isContainer : function(row) {
        return this.visibleItems[row].isContainer;
    },

    isContainerOpen : function(row) {
        return this.visibleItems[row].isOpen;
    },

    isContainerEmpty : function(row) {
        return this.itemsMap[this.visibleItems[row].label].length == 0;
    },

    getParentIndex : function(idx) {
        if (this.isContainer(idx)) return -1;
        for (var t = idx - 1; t >= 0 ; t--) {
            if (this.isContainer(t)) return t;
        }
        return -1;
    },

    hasNextSibling : function(idx, after) {
        var thisLevel = this.getLevel(idx);
        for (var t = after + 1; t < this.visibleItems.length; t++) {
          var nextLevel = this.getLevel(t);
          if (nextLevel == thisLevel) return true;
          if (nextLevel < thisLevel) break;
        }
        return false;
    },

    getLevel : function(row) {
        return this.isContainer(row) ? 0 : 1;
    },

    toggleOpenState : function(idx) {
        var item = this.visibleItems[idx];

        if (!item.isContainer) return;

        if (item.isOpen) {
            item.isOpen = false;

            var thisLevel = this.getLevel(idx);
            var deletecount = 0;
            for (var t = idx + 1; t < this.visibleItems.length; t++) {
                if (this.getLevel(t) > thisLevel) deletecount++;
                else break;
            }
            if (deletecount) {
                this.visibleItems.splice(idx + 1, deletecount);
                this.treebox.rowCountChanged(idx + 1, -deletecount);
            }
        } else {
            item.isOpen = true;

            var label = item.label;
            var toInsert = this.itemsMap[label];

            for (var i = 0; i < toInsert.length; i++) {
                var result = toInsert[i];
                var historyItem = {
                    isContainer : false,
                    result : toInsert[i]
                }
                this.visibleItems.splice(idx + i + 1, 0, historyItem);
            }
            this.treebox.rowCountChanged(idx + 1, toInsert.length);
        }
        this.treebox.invalidateRow(idx);
    },

    get rowCount() {
        return this.visibleItems.length;
    },

    setTree : function(treebox){
        this.treebox = treebox;
    },

    cycleCell : function(row, column) {},
    getImageSrc : function(row, column) {return null;},
    getCellProperties : function(row, column, props) {},

    cycleHeader : function(col, elem) {},
    isSeparator : function(row){ return false; },
    isSorted : function(row){ return false; },
    getRowProperties : function(row,props){},
    getColumnProperties : function(colid,col,props){},

    isEditable : function(row, col) {return false;},
    isSelectable : function(row, col) {return false;},
    setCellValue : function(row, col, value) {},
    setCellText : function(row, col, value) {},
    performAction : function(action) {},
    performActionOnRow : function(action, row) {},
    performActionOnCell : function(action, row, col) {},
    canDrop : function(index, orientation, dataTransfer) {return false;},
    drop : function(row, orientation, dataTransfer) {},
    getProgressMode : function(row, col) {return false;},
    getCellValue : function(row, col) {return null;},
    selectionChanged : function() {}
};

