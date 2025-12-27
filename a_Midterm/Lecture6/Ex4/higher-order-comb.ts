const combine = <T, U, V>(f: (t:T) => U, g: (u:U) => V) => (x: T) => g(f(x));

const pipe = <T, U, V>(f: (t:T) => U, g: (u:U) => V) => (x: T) => g(f(x));

const multiPipe = <T>(...fns: Array<(arg: T) => T>) => (x: T): T => {
    //recursive implementation
    if (fns.length === 0) {
        return x;
    }
    const [firstFn, ...restFns] = fns;
    // use pipe to chain the first function with the rest
    return pipe(firstFn, multiPipe(...restFns))(x);
}

const tap = <T>(fn: (arg: T) => void) => (x: T): T => {
    fn(x);
    return x;
};

const doubleSquare = combine(
    (x: number) => x * x,
    (x: number) => x * 2,
);

const tapLog = tap(console.log);

const tappedDoubleSquare = combine(
    tapLog,
    doubleSquare
);

tappedDoubleSquare(3);

const combine2 = function (first, second) {
    const combined = function (x) {
        const fresult = first(x);
        const sresult = second(fresult);
        return sresult;
    };
    return combined;
}
