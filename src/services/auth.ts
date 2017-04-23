const STORAGE_KEY = "AUTH_TOKEN"

export function get(): Promise<string> {
    return new Promise((resolve, reject) => {
        return resolve(localStorage.getItem(STORAGE_KEY));
    });
}

export function set(token: string): Promise<{}> {
    return new Promise((resolve, reject) => {
        localStorage.setItem(STORAGE_KEY, token);
        return resolve();
    });
}

export function clear(): Promise<{}> {
    return new Promise((resolve, reject) => {
        localStorage.removeItem(STORAGE_KEY);
        return resolve();
    });
}