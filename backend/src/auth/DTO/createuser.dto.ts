import {IsEmail, IsNotEmpty, IsString, MinLength} from 'class-validator';

export class userDto{
    @IsString()
    @IsNotEmpty()
    NameUser: string

    @IsString()
    @MinLength(10)
    @IsNotEmpty()    
    passwordUser: string

    @IsEmail()
    @IsString()
    @IsNotEmpty()
    emailUser: string
}