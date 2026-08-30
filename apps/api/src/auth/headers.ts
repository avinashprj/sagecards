import type { IncomingHttpHeaders } from 'node:http'

/**
 * Node's IncomingHttpHeaders (values may be string[]) → fetch Headers, which
 * Better-Auth's server API expects. Multi-value headers (e.g. cookie in raw
 * requests) are appended so nothing is dropped.
 */
export function toFetchHeaders(incoming: IncomingHttpHeaders): Headers {
  const headers = new Headers()
  for (const [name, value] of Object.entries(incoming)) {
    if (typeof value === 'string') {
      headers.set(name, value)
    } else if (Array.isArray(value)) {
      for (const item of value) headers.append(name, item)
    }
  }
  return headers
}
