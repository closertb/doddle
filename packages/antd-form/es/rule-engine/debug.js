let isOpen = false;
export default function debug(...message) {
    try {
        isOpen = isOpen || ((typeof process !== 'undefined' && process.env && process.env.DEBUG && process.env.DEBUG.match(/json-rules-engine/)) ||
            (typeof window !== 'undefined' && window.localStorage && window.localStorage.debug && window.localStorage.debug.match(/json-rules-engine/)));
        if (isOpen) {
            console.log(...message);
        }
    }
    catch (ex) {
        // Do nothing
    }
}
