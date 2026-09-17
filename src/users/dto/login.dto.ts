import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    /**
     * Email address registered via POST /users.
     * @example "jane.doe@example.com"
     */
    @IsString()
    @IsNotEmpty()
    email: string

    /**
     * Account password.
     * @example "SuperSecret123"
     */
    @IsString()
    @IsNotEmpty()
    password: string
}
