import {
  getBankAccount,
  InsufficientFundsError,
  SynchronizationFailedError,
  TransferFailedError,
} from '.';
import * as lodash from 'lodash';

jest.mock('lodash');

describe('BankAccount', () => {
  test('should create account with initial balance', () => {
    const account = getBankAccount(100);
    expect(account.getBalance()).toBe(100);
  });

  test('should throw InsufficientFundsError error when withdrawing more than balance', () => {
    const account = getBankAccount(100);
    expect(() => account.withdraw(200)).toThrow(InsufficientFundsError);
  });

  test('should throw error when transferring more than balance', () => {
    const account = getBankAccount(100);
    const anotherAccount = getBankAccount(50);
    expect(() => account.transfer(200, anotherAccount)).toThrow(
      InsufficientFundsError,
    );
  });

  test('should throw error when transferring to the same account', () => {
    const account = getBankAccount(100);
    expect(() => account.transfer(50, account)).toThrow(TransferFailedError);
  });

  test('should deposit money', () => {
    const account = getBankAccount(100);
    account.deposit(50);
    expect(account.getBalance()).toBe(150);
  });

  test('should withdraw money', () => {
    const account = getBankAccount(100);
    account.withdraw(50);
    expect(account.getBalance()).toBe(50);
  });

  test('should transfer money', () => {
    const account = getBankAccount(100);
    const anotherAccount = getBankAccount(50);
    account.transfer(50, anotherAccount);
    expect(account.getBalance()).toBe(50);
    expect(anotherAccount.getBalance()).toBe(100);
  });

  test('fetchBalance should return number in case if request did not failed', async () => {
    const account = getBankAccount(100);
    (lodash.random as jest.Mock).mockReturnValueOnce(50).mockReturnValueOnce(1);
    const balance = await account.fetchBalance();
    expect(typeof balance).toBe('number');
    expect(balance).toBeGreaterThanOrEqual(0);
    expect(balance).toBeLessThanOrEqual(100);
    jest.resetAllMocks();
  });

  test('should set new balance if fetchBalance returned number', async () => {
    const account = getBankAccount(100);
    (lodash.random as jest.Mock).mockReturnValueOnce(50).mockReturnValueOnce(1);
    await account.synchronizeBalance();
    expect(account.getBalance()).toBe(50);
    jest.resetAllMocks();
  });

  test('should throw SynchronizationFailedError if fetchBalance returned null', async () => {
    const account = getBankAccount(100);
    jest.spyOn(account, 'fetchBalance').mockResolvedValue(null);
    await expect(account.synchronizeBalance()).rejects.toThrow(
      SynchronizationFailedError,
    );
    jest.resetAllMocks();
  });
});
