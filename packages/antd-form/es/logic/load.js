;
export function loadResourceMap(resources) {
    const resourceMap = new Map();
    const depsResouces = [];
    resources.forEach(resource => {
        var _a;
        // 计算一个合适的sort值，依赖越多，sort值越大
        resourceMap.set(resource.library, Object.assign(Object.assign({}, resource), { loaded: !!window[resource.library], sort: Number(!window[resource.library]) * Number((((_a = resource.assetsBundle) === null || _a === void 0 ? void 0 : _a.length) || 0) + 1) }));
        if (Array.isArray(resource.assetsBundle)) {
            depsResouces.push(...resource.assetsBundle);
        }
    });
    depsResouces.forEach(resource => {
        if (resourceMap.has(resource.library)) {
            return;
        }
        resourceMap.set(resource.library, Object.assign(Object.assign({}, resource), { loaded: !!window[resource.library], sort: 0 }));
    });
    return resourceMap;
}
export function getResourceDepsArr(resources) {
    const depthMap = new Map();
    const depsResourceArray = [];
    // 先按依赖度 排个顺序
    const resouresSort = resources.sort((a, b) => a.sort - b.sort);
    // 创建依赖加载优先级数组
    function buildDependencySort(items, depth = 1) {
        const nextItems = [];
        const cleanItems = items.filter((item) => {
            if (item.loaded) {
                depthMap.set(item.library, 0);
                return false;
            }
            if (depthMap.has(item.library))
                return false;
            const depsItems = (item.assetsBundle || []).filter((asset) => {
                // console.log('tttt:', item.library, asset.library, depthMap.has(asset.library), depthMap.get(asset.library));
                return !(depthMap.has(asset.library) && depth > depthMap.get(asset.library));
            });
            if (depsItems.length) {
                nextItems.push(item);
                return false;
            }
            depthMap.set(item.library, depth);
            return true;
        });
        if (cleanItems.length) {
            depsResourceArray.push(cleanItems);
        }
        if (depth < 5 && nextItems.length) {
            buildDependencySort(nextItems, depth + 1);
        }
        if (depth >= 5) {
            throw new Error('递归有bug，排查一下');
        }
    }
    buildDependencySort(resouresSort, 1);
    return depsResourceArray;
}
export function preloadResoures(resources) {
    resources.forEach(resource => {
        // 已经有了，就不用加载了
        if (window && window[resource.library]) {
            return;
        }
        // js 预加载，css 直接加载
        resource.urls.forEach((firstUrl) => {
            const link = document.createElement('link');
            const isJsLink = /\.js$/.test(firstUrl);
            link.rel = isJsLink ? 'preload' : 'stylesheet';
            link.href = firstUrl;
            link.as = isJsLink ? 'script' : undefined;
            document.head.appendChild(link);
        });
    });
}
function loadScript(resource) {
    const url = resource.urls.find((url) => /\.js$/.test(url));
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}
// function loadResource(array) {
//   // 从没有依赖的资源开始加载
//   const startLoading = [];
//   array.forEach(name => {
//       startLoading.push(loadResource(name));
//   });
// }
function loadResource(resource) {
    if (resource.loaded)
        return Promise.resolve();
    resource.loaded = true;
    // 加载依赖
    const url = resource.urls.find((url) => /\.js$/.test(url));
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}
export function stepLoadResource(loadSourceArr) {
    let resolve = Promise.resolve(true);
    loadSourceArr.forEach((arr) => {
        // @ts-ignore
        resolve = resolve.then(() => {
            // 从没有依赖的资源开始加载
            const startLoading = [];
            arr.forEach(resource => startLoading.push(loadResource(resource)));
            return Promise.all(startLoading);
        });
    });
    return resolve;
}
export function loadResources(resources) {
    const resourceMap = loadResourceMap(resources);
    const resouresSort = Array.from(resourceMap.values());
    preloadResoures(resouresSort);
    const loadSourceArr = getResourceDepsArr(resouresSort);
    return stepLoadResource(loadSourceArr);
}
