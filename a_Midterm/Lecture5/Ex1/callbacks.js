function doTwoStuffs(first, second) {
    doStuffLater(() => {
        first?.();
        doStuffLater(() => {
            second?.();
        });
    });
}

function doStuffLater(callback) {
    setTimeout(() => callback?.(), 2000);
}

//Demo
doTwoStuffs(
    () => console.log("First callback after 2 seconds"),
    () => console.log("Second callback after 2 seconds")
);