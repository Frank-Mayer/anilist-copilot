const { Parcel } = require("@parcel/core");
const fs = require("fs/promises");
const path = require("path");

const paths = {
  distDir: "./public",
};

const buildBackground = async () => {
  const bundler = new Parcel({
    entries: "./src/background/index.ts",
    defaultConfig: "@parcel/config-default",
    mode: "production",
    defaultTargetOptions: {
      outputFormat: "commonjs",
      shouldOptimize: true,
      sourceMaps: false,
      distDir: paths.distDir,
      engines: {
        browsers: ["last 1 Chrome version"],
      },
    },
  });

  try {
    const { buildTime } = await bundler.run();
    console.log(`Background build finished in ${buildTime}ms`);
    await fs.rename(
      path.join(paths.distDir, "index.js"),
      path.join(paths.distDir, "background.js")
    );
  } catch (err) {
    console.log(err.diagnostics);
  }
};

const buildContent = async () => {
  const bundler = new Parcel({
    entries: "./src/content/index.ts",
    defaultConfig: "@parcel/config-default",
    mode: "production",
    defaultTargetOptions: {
      outputFormat: "commonjs",
      shouldOptimize: true,
      sourceMaps: false,
      distDir: paths.distDir,
      engines: {
        browsers: ["last 1 Chrome version"],
      },
    },
  });

  try {
    const { buildTime } = await bundler.run();
    console.log(`Content build finished in ${buildTime}ms`);
    await fs.rename(
      path.join(paths.distDir, "index.js"),
      path.join(paths.distDir, "content.js")
    );
  } catch (err) {
    console.log(err.diagnostics);
  }
};

const buildOptions = async () => {
  const bundler = new Parcel({
    entries: "./src/popup/index.html",
    defaultConfig: "@parcel/config-default",
    mode: "production",
    defaultTargetOptions: {
      outputFormat: "commonjs",
      shouldOptimize: true,
      sourceMaps: false,
      distDir: paths.distDir,
      engines: {
        browsers: ["last 1 Chrome version"],
      },
    },
  });

  try {
    const { buildTime } = await bundler.run();
    console.log(`Popup build finished in ${buildTime}ms`);
    await fs.rename(
      path.join(paths.distDir, "index.html"),
      path.join(paths.distDir, "popup.html")
    );
  } catch (err) {
    console.log(err.diagnostics);
  }
};

(async () => {
  await buildBackground();
  await buildContent();
  await buildOptions();
})();
