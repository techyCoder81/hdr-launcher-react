// CommonJS entry for development: newer Electron loads a .ts "main" through the
// native ESM loader, which bypasses ts-node's require hook and breaks
// extensionless imports. Registering ts-node here keeps resolution on CJS.
require('ts-node/register/transpile-only');
require('../../src/main/main.ts');
