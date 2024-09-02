import { Segments } from '@formily/path/esm/types';
/**
 * 匹配
 * @param queryPath deo.*.price
 * @param changedPath deo.1.price
 */
export declare const matchPath: (queryPath: string, changedPath: string) => {
    entire: string;
    segments: Segments;
} | null;
