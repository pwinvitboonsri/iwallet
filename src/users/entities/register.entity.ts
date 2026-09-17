import { Exclude } from "class-transformer"
import { Role } from "../../generated/prisma/enums.js"

export class RegisterEntity {
    /**
     * User ID.
     * @example "018f2f5a-1a2b-7c3d-9e4f-5a6b7c8d9e0f"
     */
    id: string

    /**
     * Registered email address.
     * @example "jane.doe@example.com"
     */
    email: string

    @Exclude()
    password: string

    /**
     * Access level for this user.
     * @example "USER"
     */
    role: Role

    /**
     * When the account was created.
     * @example "2026-09-16T03:36:02.810Z"
     */
    createAt: Date

    constructor(partial: Partial<RegisterEntity>) {
        Object.assign(this, partial)
    }
}
