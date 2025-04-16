import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Body,
  UnauthorizedException 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResetPassword } from './DTO/ResetPassword.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('api/auth')
export class AuthController {
  constructor(private AuthService: AuthService,
  private readonly jwtService: JwtService,
  ) {}
  @Get()
  getUsers() {
    return this.AuthService.getAllusers();
  }
  @Get(':username')
  getUser(@Param('username') username: string) {
    return this.AuthService.getOneUser(username);
  }
  @Post('/login')
  async Postlogin(@Body('username') username: string, @Body('password') password: string) {
    try {
      // Autenticar con Traccar
      const traccarResponse = await this.AuthService.login(username, password);

      // Generar un token JWT para el usuario autenticado
      const payload = { username: username, sub: traccarResponse.user.id };
      return {
        access_token: this.jwtService.sign(payload),
        message: traccarResponse.message,
        user: traccarResponse.user, // Opcional: devolver los datos del usuario
      };
    } catch (error) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
  }
  @Post('/changepass')
  async changePass(@Body() body: { emailUser: string }) {
    return await this.AuthService.changepass(body.emailUser);
  }
  @Post('/reset-password/:token')
  async resetPass(@Param('token') token: string, @Body() body: ResetPassword) {
    return await this.AuthService.resetPass(token, body.newPassword);
  }
}
