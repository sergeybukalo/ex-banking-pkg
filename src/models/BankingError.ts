export class WrongArguments extends Error {
    constructor() {
        super();
        Object.setPrototypeOf(this, WrongArguments.prototype);
        this.name = this.constructor.name;
    }
}

export class UserAlreadyExists extends Error {
    constructor(username: string) {
        super(`user ${username} already exists`);
        Object.setPrototypeOf(this, UserAlreadyExists.prototype);
        this.name = this.constructor.name;
    }
}

export class UserDoesNotExist extends Error {
    constructor(username: string) {
        super(`user ${username} doesn't exist`);
        Object.setPrototypeOf(this, UserDoesNotExist.prototype);
        this.name = this.constructor.name;
    }
}

export class NotEnoughMoney extends Error {
    constructor(username: string, currentBalace: number) {
        super(`the current balace of the user ${username} is ${currentBalace}`);
        Object.setPrototypeOf(this, NotEnoughMoney.prototype);
        this.name = this.constructor.name;
    }
}

export class SenderDoesNotExist extends Error {
    constructor() {
        super();
        Object.setPrototypeOf(this, SenderDoesNotExist.prototype);
        this.name = this.constructor.name;
    }
}

export class ReceiverDoesNotExist extends Error {
    constructor() {
        super();
        Object.setPrototypeOf(this, ReceiverDoesNotExist.prototype);
        this.name = this.constructor.name;
    }
}

export type BankingError =
    | Error
    | WrongArguments
    | UserAlreadyExists
    | UserDoesNotExist
    | NotEnoughMoney
    | SenderDoesNotExist
    | ReceiverDoesNotExist;
