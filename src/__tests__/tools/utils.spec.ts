import {
  encodeObjectToBase64,
  getAccessToken,
  getReportOrderStatus,
  getStatusPrint,
} from '~/lib/helpers';
import { useUserAuthStore } from '~/lib/store/store';

describe('Utils function', () => {
  it('should return access token when user is authenticated', () => {
    const { setUser } = useUserAuthStore.getState();
    const user = { access_token: 'valid_token' } as any;
    setUser(user);
    const token = getAccessToken();
    expect(token).toBe('valid_token');
  });

  it('should return undefined when user object is empty', () => {
    const { removeUser } = useUserAuthStore.getState();
    removeUser();
    const token = getAccessToken();
    expect(token).toBeUndefined();
  });

  it('should return "Release" when status is 2 and approvalStatus is 1', () => {
    const result = getReportOrderStatus(2, 1);
    expect(result).toBe('Release');
  });

  it('should return "Rejected" when status is 2 and approvalStatus is not 1 or 0', () => {
    const result = getReportOrderStatus(2, 3);
    expect(result).toBe('Rejected');
  });

  it('should return "Waiting implementation" when input is 0', () => {
    const result = getStatusPrint(0);
    expect(result).toBe('Waiting implementation');
  });

  it('should return undefined when input is negative', () => {
    const result = getStatusPrint(-1);
    expect(result).toBeUndefined();
  });

  it('should encode a simple object to Base64 string when given a valid object', () => {
    const obj = { name: 'John', age: 30 };
    const result = encodeObjectToBase64(obj);
    const expected = btoa(JSON.stringify(obj));
    expect(result).toBe(expected);
  });
});
