export interface TConsoleBase {
    error: TConsoleFn
    warn: TConsoleFn
    log: TConsoleFn
    info: TConsoleFn
    debug: TConsoleFn
    trace: TConsoleFn
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TConsoleFn = ((...args: any[]) => void)
