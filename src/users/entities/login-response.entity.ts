export class LoginUserEntity {
  /**
   * User ID.
   * @example "018f2f5a-1a2b-7c3d-9e4f-5a6b7c8d9e0f"
   */
  id: string;

  /**
   * Registered email address.
   * @example "jane.doe@example.com"
   */
  email: string;

  /**
   * Access level for this user.
   * @example "USER"
   */
  role: string;
}

export class LoginResponseEntity {
  /**
   * JWT to send as `Authorization: Bearer <token>` on subsequent requests.
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMTgi..."
   */
  access_token: string;

  user: LoginUserEntity;

  constructor(partial: Partial<LoginResponseEntity>) {
    Object.assign(this, partial);
  }
}
