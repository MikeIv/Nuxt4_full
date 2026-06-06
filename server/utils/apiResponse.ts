/** Обёртка успешного ответа API (нед. 2+). Health на нед. 1 — плоский объект. */
export type ApiOkResponse<T> = { data: T }

export function ok<T>(data: T): ApiOkResponse<T> {
  return { data }
}
