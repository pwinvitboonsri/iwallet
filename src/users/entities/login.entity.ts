import { RegisterEntity } from './register.entity.js';

export class LoginEntity {
  access_token: string;
  user: RegisterEntity;

  constructor(partial: Partial<LoginEntity>) {
    Object.assign(this, partial);
  }
}
