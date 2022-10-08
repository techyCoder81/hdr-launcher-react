/// this file is for switch offline web browser bootstrap logic

export function sendMessage(object) {
    console.debug("sending to nx: \n" + object)
    window.nx.sendMessage(object);
}

export function addEventListener(eventName, callback) {
    return window.nx.addEventListener(eventName, callback);
}

export function removeEventListener(listener) {
    return window.nx.removeEventListener(listener);
}

export function printData() {
    console.debug("window.nx names:");
    console.debug(Object.getOwnPropertyNames(window.nx));
}

export function setButtonAction(button, action) {
    if (window.nx) {
        window.nx.footer.setAssign(button, "", action);
    } else {
        console.info("not on nx, no button assignments made.");
    }
}

export function setScrollSpeed(speed) {
    if (window.nx) {
        window.nx.setCursorScrollSpeed(speed);
    }
}