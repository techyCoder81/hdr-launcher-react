export function sendMessage(object) {
    console.log("sending to nx: \n" + object)
    window.nx.sendMessage(object);
}

export function addEventListener(eventName, callback) {
    return window.nx.addEventListener(eventName, callback);
}

export function removeEventListener(listener) {
    return window.nx.removeEventListener(listener);
}

export function printData() {
    console.log("window.nx names:");
    console.log(Object.getOwnPropertyNames(window.nx));
}