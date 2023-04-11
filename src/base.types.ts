export interface TConsoleBase {
    error: TConsoleFn
    warn: TConsoleFn
    log: TConsoleFn
    info: TConsoleFn
    debug: TConsoleFn
    trace: TConsoleFn
}

export type TConsoleFn = ((...args: any[]) => void)
