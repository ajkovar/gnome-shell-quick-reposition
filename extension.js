const Workspace = imports.ui.workspace
const Mainloop = imports.mainloop;

let _oldDoRemoveWindow

const WindowPositionFlags = {
    INITIAL: 1 << 0,
    ANIMATE: 1 << 1
};

function init() {
	_oldDoRemoveWindow = Workspace.Workspace.prototype._doRemoveWindow
}

function enable() {
	Workspace.Workspace.prototype._doRemoveWindow = function(metaWin) {
		global.log("start _doRemoveWindow")
		let win = metaWin.get_compositor_private();

		// find the position of the window in our list
		let index = this._lookupIndex (metaWin);

		if (index == -1)
		    return;

		// Check if window still should be here
		if (win && this._isMyWindow(win))
		    return;

		let clone = this._windows[index];

		this._windows.splice(index, 1);
		this._windowOverlays.splice(index, 1);

		// If metaWin.get_compositor_private() returned non-NULL, that
		// means the window still exists (and is just being moved to
		// another workspace or something), so set its overviewHint
		// accordingly. (If it returned NULL, then the window is being
		// destroyed; we'd like to animate this, but it's too late at
		// this point.)
		if (win) {
		    let [stageX, stageY] = clone.actor.get_transformed_position();
		    let [stageWidth, stageHeight] = clone.actor.get_transformed_size();
		    win._overviewHint = {
		        x: stageX,
		        y: stageY,
		        scale: stageWidth / clone.actor.width
		    };
		}
		clone.destroy();

		this.positionWindows(WindowPositionFlags.ANIMATE);
		
	}
}

function disable() {
	Workspace.Workspace.prototype._doRemoveWindow = _oldDoRemoveWindow
}
