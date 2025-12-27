function doStuffLater(callback) {
    setTimeout(() => callback?.(), 2000);
}

function doStuffPromise() {
    return new Promise((resolve) => {
        doStuffLater(resolve);
    });
}

//resolve after 2s
doStuffPromise().then(
    () => console.log("Resolved after 2 seconds")
);

//resolve/reject based on flag
function maybeDoStuff(shouldDoStuff) {
    return new Promise((resolve, reject) => {
        doStuffLater(() => {
            if(shouldDoStuff) {
                resolve("Task finished ✅");
            }
            else reject(new Error("Task failed ❌"));
        });
    });
}

maybeDoStuff(true)
    .then(msg => console.log(msg))
    .catch(err => console.log(err.message));
maybeDoStuff(false)
    .then(msg => console.log(msg))
    .catch(err => console.log(err.message));
