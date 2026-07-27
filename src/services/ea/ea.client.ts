import "server-only"

const EA_HEADERS: HeadersInit = {
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    Referer: "https://proclubs.ea.com/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
}

export async function fetchEa<T>(url: string, resourceName: string, timeoutMs = 10_000): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: EA_HEADERS,
            cache: "no-store",
            signal: controller.signal,
        })

        if (!response.ok) {
            throw new Error(`A API da EA retornou HTTP ${response.status} ao consultar ${resourceName}.`)
        }

        return (await response.json()) as T
    } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
            throw new Error(`A consulta de ${resourceName} excedeu o limite de ${timeoutMs / 1000} segundos.`)
        }

        if (error instanceof Error) throw error

        throw new Error(`Não foi possível consultar ${resourceName} na API da EA.`)
    } finally {
        clearTimeout(timeout)
    }
}