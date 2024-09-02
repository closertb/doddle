interface TResource {
    library: string;
    version?: string;
    type?: 'normal' | 'others';
    urls: string[];
    assetsBundle: TResource[];
    loaded?: boolean;
    sort?: number;
}
export declare function loadResourceMap(resources: TResource[]): Map<string, TResource>;
export declare function getResourceDepsArr(resources: TResource[]): TResource[][];
export declare function preloadResoures(resources: TResource[]): void;
export declare function stepLoadResource(loadSourceArr: TResource[][]): Promise<boolean>;
export declare function loadResources(resources: TResource[]): Promise<boolean>;
export {};
