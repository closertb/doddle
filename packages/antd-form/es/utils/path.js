import { FormPath } from '@formily/core';
/**
 * 匹配
 * @param queryPath deo.*.price
 * @param changedPath deo.1.price
 */
export const matchPath = (queryPath, changedPath) => {
    const pathCore = FormPath.parse(queryPath);
    const isMatch = pathCore.match(changedPath);
    if (isMatch) {
        const { entire, segments } = FormPath.parse(changedPath);
        const fixedSegments = segments.map((seg) => {
            const num = Number(seg);
            return isNaN(num) ? seg : num;
        });
        return {
            entire: entire,
            segments: fixedSegments,
        };
    }
    return null;
};
