const deploy = require("shipit-deploy")
const shared = require("shipit-shared")

module.exports = shipit => {
  deploy(shipit)
  shared(shipit)

  shipit.initConfig({
    default: {
      workspace: ".shipit",
      repositoryUrl: "git@github.com:tim-field/avd.git",
      ignores: [".git"],
      keepReleases: 3,
      shallowClone: true,
      deployTo: "/var/www/avd/",
      branch: "master",
      shared: {
        files: [
          { path: ".env", overwrite: true },
          { path: "pm2-ecosystem.json", overwrite: false }
        ]
      }
    },
    live: {
      servers: "223.165.66.57"
    }
  })

  shipit.on("updated", () => shipit.start("yarn:install", "npm:build"))

  shipit.blTask("yarn:install", () =>
    shipit.remote(
      `cd ${shipit.releasePath}; nice yarn install --production --non-interactive`
    )
  )

  shipit.blTask("npm:build", () =>
    shipit.remote(`cd ${shipit.releasePath}; nice npm run build`)
  )

  shipit.task("reload-app", () =>
    shipit.remote(
      `cd ${shipit.config.deployTo} && pm2 startOrRestart --env ${
        shipit.environment
      } current/pm2-ecosystem.json`
    )
  )

  shipit.on("published", () => shipit.start("reload-app"))
}
