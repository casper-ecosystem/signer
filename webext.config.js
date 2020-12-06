module.exports = {
  // Global.
  sourceDir: "./build",
  artifactsDir: "./artifacts",
  // Leave out the testing methods for security
  ignoreFiles: [
    './scripts/content/signerTestMethods.js'
  ],
  // Build.
  build: {
    overwriteDest: true,
  }
}
