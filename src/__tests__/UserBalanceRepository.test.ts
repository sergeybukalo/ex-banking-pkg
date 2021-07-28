import {
    NotEnoughMoney,
    ReceiverDoesNotExist,
    SenderDoesNotExist,
    UserAlreadyExists,
    UserDoesNotExist,
    WrongArguments,
} from '../models';
import { IUserBalanceRepository, UserBalanceRepository } from '../repos';

describe('UserBalanceRepository', () => {
    let repo: IUserBalanceRepository;

    beforeEach(() => {
        repo = new UserBalanceRepository();
    });

    describe('addUser method', () => {
        test('should create the user', () => {
            ['user 1', 'user 2', 'user 3'].forEach((user) => {
                const result = repo.addUser(user);
                expect(result).toEqual({ success: true });
            });
        });

        test('should return UserAlreadyExists', () => {
            let result = repo.addUser('user 1');
            expect(result).toEqual({ success: true });
            result = repo.addUser('user 2');
            expect(result).toEqual({ success: true });
            result = repo.addUser('user 2');
            expect(result).toBeInstanceOf(UserAlreadyExists);
        });
    });

    describe('getBalance method', () => {
        test('should return balance 0', () => {
            repo.addUser('user 1');
            const result = repo.getBalance('user 1', 'USD');
            expect('balance' in result && result.balance).toEqual(0);
        });

        test('should return UserDoesNotExist', () => {
            repo.addUser('user 1');
            const result = repo.getBalance('user 2', 'USD');
            expect(result).toBeInstanceOf(UserDoesNotExist);
        });
    });

    describe('deposit method', () => {
        test('should make deposit 50 and return the same balance', () => {
            repo.addUser('user 1');
            const depositResult = repo.deposit('user 1', 50, 'USD');
            expect('newBalance' in depositResult && depositResult.newBalance).toEqual(50);
            const result = repo.getBalance('user 1', 'USD');
            expect('balance' in result && result.balance).toEqual(50);
        });

        test('should sum deposit and return correct balance', () => {
            repo.addUser('user 1');
            let depositResult = repo.deposit('user 1', 50, 'USD');
            expect('newBalance' in depositResult && depositResult.newBalance).toEqual(50);
            depositResult = repo.deposit('user 1', 50, 'USD');
            expect('newBalance' in depositResult && depositResult.newBalance).toEqual(100);
            const result = repo.getBalance('user 1', 'USD');
            expect('balance' in result && result.balance).toEqual(100);
        });

        test('should return UserDoesNotExist for deposit method', () => {
            let depositResult = repo.deposit('user 1', 50, 'USD');
            expect(depositResult).toBeInstanceOf(UserDoesNotExist);
        });

        test('should return WrongArguments for deposit method', () => {
            repo.addUser('user 1');
            const depositResult = repo.deposit('user 1', -100, 'USD');
            expect(depositResult).toBeInstanceOf(WrongArguments);
        });

        test('should return UserDoesNotExist for deposit method', () => {
            let withdrawResult = repo.deposit('user 1', 1000, 'USD');
            expect(withdrawResult).toBeInstanceOf(UserDoesNotExist);
        });

        test('should deposit 4.7', () => {
            repo.addUser('user 1');
            repo.deposit('user 1', 2.3, 'USD');
            const result = repo.deposit('user 1', 2.4, 'USD');
            expect('newBalance' in result && result.newBalance).toBe(4.7);
        });

        test.each([
            [2.311111, 2.411111, 4.72],
            [2.411111, 2.418111, 4.83],
        ])('should deposit %s, %s and return %s', (num1, num2, res) => {
            repo.addUser('user 1');
            repo.deposit('user 1', num1, 'USD');
            const result = repo.deposit('user 1', num2, 'USD');
            expect('newBalance' in result && result.newBalance).toBe(res);
        });
    });

    describe('withdraw method', () => {
        test('should return UserDoesNotExist for withdraw method', () => {
            let depositResult = repo.withdraw('user 1', 50, 'USD');
            expect(depositResult).toBeInstanceOf(UserDoesNotExist);
        });

        test('should withdraw 50 from 100', () => {
            repo.addUser('user 1');
            repo.deposit('user 1', 100, 'USD');
            let withdrawResult = repo.withdraw('user 1', 50, 'USD');
            expect('newBalance' in withdrawResult && withdrawResult.newBalance).toEqual(50);
            const result = repo.getBalance('user 1', 'USD');
            expect('balance' in result && result.balance).toEqual(50);
        });

        test('should return WrongArguments for withdraw method', () => {
            repo.addUser('user 1');
            repo.deposit('user 1', 100, 'USD');
            let withdrawResult = repo.withdraw('user 1', -50, 'USD');
            expect(withdrawResult).toBeInstanceOf(WrongArguments);
        });

        test('should return NotEnoughMoney for withdraw method', () => {
            repo.addUser('user 1');
            repo.deposit('user 1', 100, 'USD');
            let withdrawResult = repo.withdraw('user 1', 1000, 'USD');
            expect(withdrawResult).toBeInstanceOf(NotEnoughMoney);
        });

        test('should return UserDoesNotExist for withdraw method', () => {
            let withdrawResult = repo.withdraw('user 1', 1000, 'USD');
            expect(withdrawResult).toBeInstanceOf(UserDoesNotExist);
        });
    });

    describe('send method', () => {
        test('should send 26 from user 1 to user 2', () => {
            repo.addUser('user 1');
            repo.addUser('user 2');
            repo.deposit('user 1', 1000, 'USD');
            repo.deposit('user 2', 1000, 'BYR');
            const result = repo.send('user 1', 'user 2', 26, 'USD');
            expect('fromUsernameBalance' in result && result.fromUsernameBalance).toBe(1000 - 26);
            expect('fromUsernameBalance' in result && result.toUsernameBalance).toBe(26);
        });

        test('should return ReceiverDoesNotExist', () => {
            repo.addUser('user 1');
            repo.addUser('user 2');
            repo.deposit('user 1', 1000, 'USD');
            repo.deposit('user 2', 1000, 'BYR');
            const result = repo.send('user 1', 'user 3', 26, 'USD');
            expect(result).toBeInstanceOf(ReceiverDoesNotExist);
        });

        test('should return SenderDoesNotExist', () => {
            repo.addUser('user 1');
            repo.addUser('user 2');
            repo.deposit('user 1', 1000, 'USD');
            repo.deposit('user 2', 1000, 'BYR');
            const result = repo.send('user 4', 'user 3', 26, 'USD');
            expect(result).toBeInstanceOf(SenderDoesNotExist);
        });

        test('should return WrongArguments', () => {
            repo.addUser('user 1');
            repo.addUser('user 2');
            repo.deposit('user 1', 1000, 'USD');
            repo.deposit('user 2', 1000, 'BYR');
            const result = repo.send('user 1', 'user 2', -26, 'USD');
            expect(result).toBeInstanceOf(WrongArguments);
        });

        test('should return NotEnoughMoney', () => {
            repo.addUser('user 1');
            repo.addUser('user 2');
            repo.deposit('user 1', 1000, 'USD');
            repo.deposit('user 2', 1000, 'BYR');
            const result = repo.send('user 1', 'user 2', 2600, 'USD');
            expect(result).toBeInstanceOf(NotEnoughMoney);
        });
    });
});
