function doStuffLater(callback) {
    setTimeout(() => callback?.(), 2000);
}

function wait2s() {
    return new Promise((res) =>
        doStuffLater(res));
}

async function doTwoStuffAsync(first, second) {
    await wait2s();
    first?.();
    await wait2s();
    second?.();
}

//Demo
doTwoStuffAsync(
    () => console.log("First (await)"),
    () => console.log("Second (await)")
);

async function doStuffPromiseAsync() {
    await wait2s();
    return "done";
}

// (async () => {
//     const msg = await doStuffPromiseAsync();
//     console.log("doStuffPromiseAsync:", msg);
// })();
const msg = await doStuffPromiseAsync();
console.log("doStuffPromiseAsync:", msg);

function maybeDoStuff(shouldDoStuff) {
    return new Promise((resolve, reject) => {
        doStuffLater(() => {
            if(shouldDoStuff) resolve("Task finished");
            else reject(new Error("Task failed"));      
        })  //fali tuka
        
    });
}

async function testMaybeDoStuff(flag) {
    try {
        const msg = await maybeDoStuff(flag);
        console.log("OK:", msg);
    } catch (err) {
        console.log("ERR:", err.message);
    }
}

//Demo
testMaybeDoStuff(true);
testMaybeDoStuff(false);