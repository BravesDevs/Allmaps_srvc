import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
    @ApiProperty({ example: 'user@example.com', description: 'The email of the new user' })
    email: string;

    @ApiProperty({ example: 'password123', description: 'The password for the new account' })
    password: string;
}
