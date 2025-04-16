import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
  HttpException,
  Put,
} from '@nestjs/common';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { CreateConcurrentDto } from './dto/create-concurrent.dto';

@Controller('api/routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  async create(@Body() createRouteDto: CreateRouteDto) {
    try {
      const newDevice = await this.routesService.createRoute(createRouteDto);
      return {
        status: HttpStatus.CREATED,
        message: 'Device created successfully',
        data: newDevice,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post('concurrent')
  async createConcurrent(@Body() createConcurrentDto: CreateConcurrentDto) {
    try {
      const newConcurrentRoute =
        await this.routesService.createConcurrentRoute(createConcurrentDto);
      return {
        status: HttpStatus.CREATED,
        message: 'Device created successfully',
        data: newConcurrentRoute,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get()
  async findAllRoute() {
    return await this.routesService.findAll();
  }
  @Put(':deviceName')
  async updateRoute(
    @Param('deviceName') deviceName: string,
    @Body() newRouteData: any,
  ) {
    return await this.routesService.UpdateDraggableRoute(
      deviceName,
      newRouteData,
    );
  }
  @Get('concurrent')
  async findnames() {
    return await this.routesService.findAllConcurrentRoutesNames();
  }
  @Get(':nombre_dispositivo')
  async findOne(@Param('nombre_dispositivo') nombre_dispositivo: string) {
    return await this.routesService.findOne(nombre_dispositivo);
  }
  @Post(':routeName/:deviceName')
  async handleRoute(
    @Param('routeName') routeName: string,
    @Param('deviceName') deviceName: string,
  ) {
    try {
      const result = await this.routesService.handleRoute(
        routeName,
        deviceName,
      );
      return {
        message: 'Ruta manejada exitosamente y pasada al dispositivo',
        data: result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
