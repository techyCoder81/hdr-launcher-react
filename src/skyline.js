export function sendMessage(object) {
    console.log("sending to nx: \n" + object)
    window.nx.sendMessage(object);
}

export function receiveMessage() {
    console.log("attempting to receive...")
    return window.nx.receiveMessage();
}

export function printData() {
    console.log("window.nx names:");
    console.log(Object.getOwnPropertyNames(window.nx));
}