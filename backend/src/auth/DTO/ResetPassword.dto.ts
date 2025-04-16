import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ResetPassword {
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password is too short. Minimum length is 6 characters.' })
  newPassword: string;
}