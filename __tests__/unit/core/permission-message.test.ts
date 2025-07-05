import { describe, it, expect } from "vitest";
import { PermissionMessage } from "../../../src/core";

describe("PermissionMessage", () => {
  it("should create with correct properties", () => {
    const message = new PermissionMessage({
      status: "failed",
      message: "Test error",
    });
    expect(message.status).toBe("failed");
    expect(message.message).toBe("Test error");
  });
});
