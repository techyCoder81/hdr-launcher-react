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