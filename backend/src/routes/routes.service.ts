import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Routes } from './entities/route.entity';
import { Concurrent } from './entities/concurrent.entity';
import { Repository } from 'typeorm';
import { CreateConcurrentDto } from './dto/create-concurrent.dto';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Routes) private routeRepository: Repository<Routes>,
    @InjectRepository(Concurrent)
    private concurrentRepository: Repository<Concurrent>,
  ) {}
  async createRoute(createRouteDto: CreateRouteDto) {
    try {
      const foundDevice = await this.routeRepository.findOne({
        where: {
          device_Name: createRouteDto.device_Name,
        },
      });
      if (foundDevice) {
        throw new HttpException(
          'This device have a route',
          HttpStatus.ALREADY_REPORTED,
        );
      }
      const newDevice = this.routeRepository.create(createRouteDto);
      const savedDevice = await this.routeRepository.save(newDevice);

      return savedDevice;
    } catch (error) {
      throw new HttpException(
        'Error creating device: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async createConcurrentRoute(createConcurrent: CreateConcurrentDto) {
    try {
      const foundConcurrent = await this.concurrentRepository.findOne({
        where: [
          { routeName: createConcurrent.routeName }, // Buscar por nombre de ruta
          {
            Startlatitud: createConcurrent.Startlatitud,
            Startlongitud: createConcurrent.Startlongitud,
            Endlatitud: createConcurrent.Endlatitud,
            Endlongitud: createConcurrent.Endlongitud,
          }, // Buscar por coordenadas
        ],
      });
      if (foundConcurrent) {
        throw new HttpException(
          'La ruta o las coordenadas ya existen',
          HttpStatus.BAD_REQUEST,
        );
      }
      const newConcurrentRoute =
        this.concurrentRepository.create(createConcurrent);
      const savedRoute =
        await this.concurrentRepository.save(newConcurrentRoute);
      return savedRoute;
    } catch (error) {
      throw new HttpException(
        'Error creating device: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async findAll() {
    return await this.routeRepository.find();
  }
  async findAllConcurrentRoutesNames() {
    return await this.concurrentRepository.find();
  }
  async findOne(nombre_dispositivo: string) {
    const foundDevice = await this.routeRepository.findOne({
      where: { device_Name: nombre_dispositivo },
    });
    if (foundDevice) {
      return { device: foundDevice };
    } else {
      return null;
    }
  }

  async UpdateDraggableRoute(deviceName: string, newRouteData: any) {
    try {
      const foundDevice = await this.routeRepository.findOne({
        where: {
          device_Name: deviceName,
        },

      });
      if (!foundDevice) {
        throw new HttpException(
          'Este dispositivo no tiene una ruta asignada',
          HttpStatus.BAD_REQUEST,
      )};
      const updateResult = await this.routeRepository.update(
        { device_Name: deviceName },
        {
          Startlatitud: newRouteData.Startlatitud,
          Startlongitud: newRouteData.Startlongitud,
          Endlatitud: newRouteData.Endlatitud,
          Endlongitud: newRouteData.Endlongitud,
        }
      );
      
      if (updateResult.affected === 0) {
        throw new HttpException(
          'No se pudo actualizar la ruta',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      
      
      // Obtener y devolver el dispositivo actualizado
      const updatedDevice = await this.routeRepository.findOne({
        where: { device_Name: deviceName },
      });
      console.log(updateResult);
      console.log(updatedDevice);
      
      return {
        message: 'Ruta actualizada con éxito',
        data: updatedDevice,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al actualizar la ruta',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async handleRoute(routeName: string, deviceName: string) {
    try {
      // Buscar la ruta concurrente por nombre
      const foundRoute = await this.concurrentRepository.findOne({
        where: { routeName },
      });

      // Si la ruta no existe, lanzar una excepción
      if (!foundRoute) {
        throw new HttpException('Esta ruta no existe', HttpStatus.NOT_FOUND);
      }

      // Buscar si el dispositivo ya tiene una ruta asignada
      const foundDevice = await this.routeRepository.findOne({
        where: { device_Name: deviceName },
      });

      // Si el dispositivo ya tiene una ruta, lanzar una excepción
      if (foundDevice) {
        throw new HttpException(
          'Este dispositivo ya tiene una ruta asignada',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Crear una nueva ruta para el dispositivo
      const newDeviceInRoute = this.routeRepository.create({
        rute_Name: foundRoute.routeName,
        Startlatitud: foundRoute.Startlatitud,
        Startlongitud: foundRoute.Startlongitud,
        Endlatitud: foundRoute.Endlatitud,
        Endlongitud: foundRoute.Endlongitud,
        device_Name: deviceName,
      });

      // Guardar la nueva ruta en la base de datos
      await this.routeRepository.save(newDeviceInRoute);

      // Devolver la nueva ruta creada
      return {
        message: 'Ruta asignada exitosamente',
        data: newDeviceInRoute,
      };
    } catch (error) {
      // Manejar errores y lanzar una excepción
      throw new HttpException(
        error.message || 'Error al asignar la ruta',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
