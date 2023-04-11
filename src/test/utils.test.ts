import { describe, test, expect } from "vitest";
import { Video } from "../plugintypes";
import { mergeVideos } from "../utils";

describe("utils", () => {
  test("mergeTracks", () => {
    const arr1: Video[] = [
      {
        id: "1",
        title: "Test Name",
        duration: 0,
      },
      {
        id: "2",
        title: "Test Name 2",
        duration: 0,
      },
    ];

    const arr2: Video[] = [
      {
        id: "3",
        title: "Test Name 3",
        duration: 0,
      },
      {
        id: "2",
        title: "Test Name arr2",
        duration: 0,
      },
    ];

    const newVideos = mergeVideos(arr1, arr2);
    expect(newVideos.length === 3).toBeTruthy();
    expect(newVideos[1].title === "Test Name arr2").toBeTruthy();
  });
});
