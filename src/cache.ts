import type { DatabaseSync } from "node:sqlite"
import type { Database } from "sqlite3"
import { blue, yellow } from "colorette"
import { CacheOptions } from "./type"
import { Logger } from "./function"

export class Cache {
    ttl: number
    max: number
    log: Logger

    NodeSQL: DatabaseSync | null
    SQLite: Database | null

    constructor(options: CacheOptions) {
        if (options && options.log) {
            if (typeof options.log === "boolean") {
                this.log = new Logger({ ShouldLog: options.log })
            } else {
                this.log = new Logger({ ShouldLog: true, prefix: options.log.prefix, timestamp: options.log.timestamp })
            }
        } else {
            this.log = new Logger({ ShouldLog: false })
        }

        if (!options) this.log.error("Cache options are required")
        if (!options.path) this.log.error("Cache path is required")
        if (!options.path || typeof options.path !== "string") this.log.error("Cache path must be a valid string")

        this.log.info(`Cache path: ${blue(options.path)}`)
        this.log.info(`Cache max: ${yellow(options.max || 100)}`)
        this.log.info(`Cache ttl: ${yellow(options.ttl || 60000)}`)
        this.log.info(`Cache log: ${options.log ? "enabled" : "disabled"}`)

        this.ttl = options.ttl || 60000
        this.max = options.max || 100

        const [major, minor] = process.versions.node.split(".").map(Number)
        this.NodeSQL = null
        this.SQLite = null

        if (!options.driver) {
            if (major > 22 || (major === 22 && minor > 5)) {
                options.driver = "node"
                this.log.info(`Node.js version is less than 22.5.0, defaulting to ${blue("node")} driver`)
            } else {
                options.driver = "sqlite3"
                this.log.info(`Node.js version is ${process.version}, defaulting to ${blue("sqlite3")} driver`)
            }
            this.log.info(`No driver specified, defaulting to ${blue("node")}`)
        }

        switch (options.driver) {
            case "node": {
                if (major < 22 || (major === 22 && minor < 5)) {
                    this.log.error(
                        `Node.js version ${process.version} is not supported by the "node" driver. Please use the "sqlite3" driver instead.`
                    )
                }

                const { DatabaseSync } = require("node:sqlite")
                this.NodeSQL = new DatabaseSync(options.path)
                this.log.info(`Using ${blue("node")} driver with path: ${options.path}`)
                break
            }

            case "sqlite3":
                const { Database } = require("sqlite3")
                this.SQLite = new Database(options.path)
                this.log.info(`Using ${blue("sqlite3")} driver with path: ${options.path}`)
                break

            default: {
                this.log.error(`Invalid driver: ${options.driver}. Supported drivers are "node" and "sqlite3".`)
            }
        }
    }
}
