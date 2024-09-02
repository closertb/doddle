import { FormPath } from '@formily/core';
import { Segments } from '@formily/path/esm/types';

/**
 * 匹配
 * @param queryPath deo.*.price
 * @param changedPath deo.1.price
 */
export const matchPath = (queryPath: string, changedPath: string): {
  entire: string;
  segments: Segments;
} | null => {
  const pathCore = FormPath.parse(queryPath);
  const isMatch = pathCore.match(changedPath);

  if (isMatch) {
    const { entire, segments } = FormPath.parse(changedPath);
    const fixedSegments = segments.map((seg) => {
      const num = Number(seg);
      return isNaN(num) ? seg : num;
    });

    return {
      entire: entire as string,
      segments: fixedSegments,
    };
  }

  return null;
};
