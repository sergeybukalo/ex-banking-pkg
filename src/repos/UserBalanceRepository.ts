import {
    BankingError,
    NotEnoughMoney,
    Ok,
    ReceiverDoesNotExist,
    SenderDoesNotExist,
    UserAlreadyExists,
    UserDoesNotExist,
    WrongArguments,
} from '../models';

const minus = (num1: number, num2: number) => +((num1 * 100 - num2 * 100) / 100).toFixed(2);
const plus = (num1: number, num2: number) => +((num1 * 100 + num2 * 100) / 100).toFixed(2);

export interface IUserBalanceRepository {
    addUser(username: string): Ok | BankingError;
    deposit(username: string, amount: number, currency: string): (Ok & { newBalance: number }) | BankingError;
    getBalance(username: string, currency: string): (Ok & { balance: number }) | BankingError;
    send(
        fromUsername: string,
        toUsername: string,
        amount: number,
        currency: string,
    ): (Ok & { fromUsernameBalance: number; toUsernameBalance: number }) | BankingError;
    withdraw(username: string, amount: number, currency: string): (Ok & { newBalance: number }) | BankingError;
}

interface UserAccount {
    [key: string]: {
        [key: string]: number;
    };
}

export class UserBalanceRepository implements IUserBalanceRepository {
    private accounts: UserAccount = {};

    addUser(username: string) {
        if (this.accounts[username]) {
            return new UserAlreadyExists(username);
        }

        this.accounts[username] = {};
        return { success: true as true };
    }

    deposit(username: string, amount: number, currency: string) {
        if (amount < 0) {
            return new WrongArguments();
        }

        const account = this.getAccount(username);
        if (account instanceof Error) {
            return account;
        }

        const currentBalance = account[currency] ?? 0;
        const newBalance = (account[currency] = plus(amount, currentBalance));

        return {
            success: true as true,
            newBalance,
        };
    }

    withdraw(username: string, amount: number, currency: string): (Ok & { newBalance: number }) | BankingError {
        if (amount < 0) {
            return new WrongArguments();
        }

        const account = this.getAccount(username);
        if (account instanceof Error) {
            return account;
        }
        const currentBalance = account[currency] ?? 0;

        if (amount > currentBalance) {
            return new NotEnoughMoney(username, currentBalance);
        }

        const newBalance = (account[currency] = minus(currentBalance, amount));

        return {
            success: true,
            newBalance,
        };
    }

    getBalance(username: string, currency: string): (Ok & { balance: number }) | BankingError {
        const account = this.getAccount(username);
        if (account instanceof Error) {
            return account;
        }
        return {
            success: true,
            balance: account[currency] ?? 0,
        };
    }

    send(
        fromUsername: string,
        toUsername: string,
        amount: number,
        currency: string,
    ): (Ok & { fromUsernameBalance: number; toUsernameBalance: number }) | BankingError {
        if (amount < 0) {
            return new WrongArguments();
        }

        const fromUser = this.accounts[fromUsername];
        if (!fromUser) {
            return new SenderDoesNotExist();
        }

        const toUser = this.accounts[toUsername];
        if (!toUser) {
            return new ReceiverDoesNotExist();
        }

        const fromUserCurrentBalance = fromUser[currency] ?? 0;

        const toUserCurrentBalance = toUser[currency] ?? 0;

        if (amount > fromUserCurrentBalance) {
            return new NotEnoughMoney(fromUsername, fromUserCurrentBalance);
        }

        const fromUsernameBalance = (fromUser[currency] = minus(fromUserCurrentBalance, amount));
        const toUsernameBalance = (toUser[currency] = plus(toUserCurrentBalance, amount));

        return {
            success: true,
            fromUsernameBalance,
            toUsernameBalance,
        };
    }

    private getAccount(username: string) {
        const account = this.accounts[username];
        if (!account) {
            return new UserDoesNotExist(username);
        }
        return account;
    }
}
