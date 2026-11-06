/** pg의 Pool과 Client가 모두 맞는 최소 형태입니다. 테스트에서 실제 Postgres에 연결합니다. */
export interface Queryable {
  query(text: string, values?: unknown[]): Promise<{ rows: unknown[] }>;
}
