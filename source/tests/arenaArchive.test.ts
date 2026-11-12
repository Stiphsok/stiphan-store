import assert from "node:assert/strict";
import { describe, it } from "node:test";
import JSZip from "jszip";
import { validateArenaArchive } from "../src/lib/arenaArchive";

async function makeZip(entries: Record<string, string>) {
  const zip = new JSZip();
  for (const [path, content] of Object.entries(entries)) zip.file(path, content);
  const bytes = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
  return new File([bytes], "arena-game.zip", { type: "application/zip" });
}

describe("Arena web-game archives", () => {
  it("accepts a normal game with HTML, JavaScript, CSS, and image assets", async () => {
    const file = await makeZip({
      "index.html": "<!doctype html><script src='game.js'></script><link rel='stylesheet' href='style.css'>",
      "game.js": "console.log('game loaded')",
      "style.css": "body { background: black }",
      "assets/sprite.png": "placeholder image bytes",
    });

    await assert.doesNotReject(validateArenaArchive(file));
  });

  it("rejects zip-slip paths", async () => {
    const file = await makeZip({
      "index.html": "<h1>game</h1>",
      "../outside.txt": "escape",
    });

    await assert.rejects(validateArenaArchive(file), /unsafe path/i);
  });

  it("rejects server-side executable payloads but permits browser scripts", async () => {
    const file = await makeZip({
      "index.html": "<script src='game.js'></script>",
      "game.js": "console.log('ok')",
      "server.php": "<?php echo 'bad'; ?>",
    });

    await assert.rejects(validateArenaArchive(file), /server executable/i);
  });

  it("rejects highly compressible entries before extraction", async () => {
    const file = await makeZip({
      "index.html": "<h1>game</h1>",
      "payload.txt": "x".repeat(2048),
    });

    await assert.rejects(validateArenaArchive(file), /compression ratio/i);
  });
});