import { Schema } from "fast-json-stringify"

export type CacheOptions = {
    schema?: Schema
    path: string
    max?: number
    ttl?: number
    driver?: "node" | "sqlite3"
    log?: boolean | { prefix?: string; timestamp?: boolean }
}

export type LoggerOptions = ShouldLog | ShouldNotLog

type ShouldNotLog = {
    ShouldLog: false
}

type ShouldLog = {
    ShouldLog?: true
    prefix?: string
    timestamp?: boolean
}
