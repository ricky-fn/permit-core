import { describe, it, expect } from "vitest";
import {
  mergeArrays,
  findSharedMembers,
} from "../../../src/utilities/array-utils";

describe("array-utils", () => {
  describe("mergeArrays()", () => {
    it("should merge arrays without duplicates", () => {
      const result = mergeArrays([1, 2], [2, 3]);
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe("findSharedMembers()", () => {
    it("should find common elements", () => {
      const result = findSharedMembers([1, 2], [2, 3]);
      expect(result).toEqual([2]);
    });
  });
});
