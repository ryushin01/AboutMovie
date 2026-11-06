// @vitest-environment node
import type { Context } from '@netlify/functions';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '../functions/account.mjs';

const mocks = vi.hoisted(() => ({
  deleteMemberData: vi.fn(),
  deleteUser: vi.fn(),
  logout: vi.fn(),
  currentMember: vi.fn(),
  rejectCrossSite: vi.fn(),
}));

vi.mock('@netlify/database', () => ({ getDatabase: () => ({ pool: {} }) }));
vi.mock('@netlify/identity', () => ({ admin: { deleteUser: mocks.deleteUser }, logout: mocks.logout }));
vi.mock('./libraryRepository', () => ({ deleteMemberData: mocks.deleteMemberData }));
vi.mock('./auth', () => ({
  currentMember: mocks.currentMember,
  isLocalDev: () => false,
  rejectCrossSite: mocks.rejectCrossSite,
  unauthorized: () => Response.json({ error: 'unauthorized' }, { status: 401 }),
}));

const call = (method = 'DELETE') =>
  handler(new Request('https://example.com/api/account', { method }), {} as Context);

describe('회원 탈퇴', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.currentMember.mockResolvedValue({ id: 'u1', email: 'a@example.com', name: null });
    mocks.rejectCrossSite.mockReturnValue(null);
    mocks.deleteMemberData.mockResolvedValue(undefined);
    mocks.deleteUser.mockResolvedValue(undefined);
    mocks.logout.mockResolvedValue(undefined);
  });

  it('기록, 계정, 쿠키 순서로 지운다', async () => {
    const response = await call();
    expect(response.status).toBe(204);
    const order = (fn: { mock: { invocationCallOrder: number[] } }) => fn.mock.invocationCallOrder[0];
    expect(order(mocks.deleteMemberData)).toBeLessThan(order(mocks.deleteUser));
    expect(order(mocks.deleteUser)).toBeLessThan(order(mocks.logout));
    expect(mocks.deleteMemberData).toHaveBeenCalledWith({}, 'u1');
    expect(mocks.deleteUser).toHaveBeenCalledWith('u1');
  });

  it('기록 삭제가 실패하면 계정을 지우지 않아 다시 시도할 수 있다', async () => {
    mocks.deleteMemberData.mockRejectedValueOnce(new Error('db'));
    await expect(call()).rejects.toThrow('db');
    expect(mocks.deleteUser).not.toHaveBeenCalled();

    expect((await call()).status).toBe(204);
    expect(mocks.deleteUser).toHaveBeenCalledOnce();
  });

  it('계정 삭제가 실패하면 알리고, 다시 시도하면 끝난다', async () => {
    mocks.deleteUser.mockRejectedValueOnce(new Error('identity'));
    await expect(call()).rejects.toThrow('identity');

    expect((await call()).status).toBe(204);
    expect(mocks.deleteMemberData).toHaveBeenCalledTimes(2);
  });

  it('쿠키 삭제가 실패해도 탈퇴는 성공이다', async () => {
    mocks.logout.mockRejectedValueOnce(new Error('cookie'));
    expect((await call()).status).toBe(204);
  });

  it('로그인하지 않았으면 아무것도 지우지 않는다', async () => {
    mocks.currentMember.mockResolvedValue(null);
    expect((await call()).status).toBe(401);
    expect(mocks.deleteMemberData).not.toHaveBeenCalled();
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it('다른 사이트의 요청은 지우지 않는다', async () => {
    mocks.rejectCrossSite.mockReturnValue(new Response(null, { status: 403 }));
    expect((await call()).status).toBe(403);
    expect(mocks.deleteMemberData).not.toHaveBeenCalled();
  });

  it('DELETE만 받는다', async () => {
    expect((await call('POST')).status).toBe(405);
  });
});
