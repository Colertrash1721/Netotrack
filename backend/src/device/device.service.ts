import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Routes } from 'src/routes/entities/route.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TraccarService {
  private readonly TRACCAR_API_URL = process.env.My_Ip;
  private readonly TRACCAR_AUTH_TOKEN = process.env.My_Token;

  constructor(
    @InjectRepository(Routes) private routeRepository: Repository<Routes>,
  ) {}

  async addDevice(deviceData: any) {
    const url = `${this.TRACCAR_API_URL}/devices`;
    const headers = {
      Authorization: `Bearer ${this.TRACCAR_AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.post(url, deviceData, { headers });
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Error al agregar dispositivo: ${error.response?.data?.message || error.message}`,
        error.response?.status || HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async deleteDevice(deviceId: string) {
    const url = `${this.TRACCAR_API_URL}/devices/${deviceId}`;
    const headers = {
      Authorization: `Bearer ${this.TRACCAR_AUTH_TOKEN}`,
    };

    try {
      const response = await axios.delete(url, { headers });
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Error al eliminar dispositivo: ${error.response?.data?.message || error.message}`,
        error.response?.status || HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async deleteRoute(deviceId: number) {
    const urlDevice = `${this.TRACCAR_API_URL}/devices/${deviceId}`;
    const headers = {
      Authorization: `Bearer ${this.TRACCAR_AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.get(urlDevice, { headers });
      const device = response.data;
      const foundDevice = await this.routeRepository.findOne({
        where: { device_Name: device.name },
      });

      if (foundDevice) {
        console.log(`Eliminando ruta para el dispositivo ${device.name}`);

        await this.routeRepository.delete(foundDevice.idRute);
      }
    } catch (error) {
      throw new HttpException(
        `Error al eliminar ruta: ${error.response?.data?.message || error.message}`,
        error.response?.status || HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async handleEndRoute(deviceName: string, deviceId: number) {
    const urlDevice = `${this.TRACCAR_API_URL}/devices/${deviceId}`;
    const headers = {
      Authorization: `Bearer ${this.TRACCAR_AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.get(urlDevice, { headers });
      const device = response.data;

      const foundDevice = await this.routeRepository.findOne({
        where: { device_Name: device.name },
      });
      if (!foundDevice) {
        return `No se encontro el dispositivo ${device.name}`;
      }
      console.log(`Eliminando ruta para el dispositivo ${device.name}`);

      await this.routeRepository.delete(foundDevice.idRute);

      try {
        const urlDriver = `${this.TRACCAR_API_URL}/drivers?deviceId=${deviceId}`;

        const driverResponse = await axios.get(urlDriver, { headers });
        const drivers = driverResponse.data;
        if (!drivers && drivers.length > 0) {
          console.log(
            `No se encontraron conductores para el dispositivo ${device.name}`,
          );
          return;
        }
        const driver = drivers[0];
        const driverIdNumber = driver.id;
        console.log(`Eliminando conductor para el dispositivo ${device.name}`);
        await axios.delete(`${this.TRACCAR_API_URL}/permissions`, {
          headers,
          data: {
            deviceId: deviceId,
            driverId: driverIdNumber,
          },
        });
      } catch (error) {
        throw new HttpException(
          `Error al manejar el conductor: ${error.response?.data?.message || error.message}`,
          error.response?.status || HttpStatus.BAD_GATEWAY,
        );
      }
    } catch (error) {
      throw new HttpException(
        `Error al manejar ruta: ${error.response?.data?.message || error.message}`,
        error.response?.status || HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async addDriver(driverName: string, driverId: string) {
    const url = `${this.TRACCAR_API_URL}/drivers`;
    const headers = {
      Authorization: `Bearer ${this.TRACCAR_AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.post(
        url,
        { name: driverName, uniqueId: driverId },
        { headers },
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Error al crear el conductor: ${error.response?.data?.message || error.message}`,
        error.response?.status || HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async assignDriverToDevice(deviceName: string, driverId: string) {
    console.log({ dispositivo: 'Dispositivo', deviceName, driverId });

    const headers = {
      Authorization: `Bearer ${this.TRACCAR_AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    };

    try {
      // 1. Obtener todos los dispositivos
      const deviceResponse = await axios.get(
        `${this.TRACCAR_API_URL}/devices`,
        { headers },
      );
      const devices = deviceResponse.data;
      const device = devices.find((device: any) => device.name === deviceName);

      if (!device) {
        throw new HttpException(
          `El dispositivo ${deviceName} no fue encontrado`,
          HttpStatus.NOT_FOUND,
        );
      }

      const deviceIdNumber = device.id;

      // 2. Obtener todos los conductores
      const driverResponse = await axios.get(
        `${this.TRACCAR_API_URL}/drivers`,
        { headers },
      );
      const drivers = driverResponse.data;
      const driver = drivers.find((d: any) => d.uniqueId === driverId);

      if (!driver) {
        throw new HttpException(
          `El conductor con ID ${driverId} no fue encontrado`,
          HttpStatus.NOT_FOUND,
        );
      }

      const driverIdNumber = driver.id;

      // 3. Asignar el conductor al dispositivo vía la API de Traccar
      await axios.post(
        `${this.TRACCAR_API_URL}/permissions`,
        {
          deviceId: deviceIdNumber,
          driverId: driverIdNumber,
        },
        { headers },
      );

      return {
        success: true,
        message: `Conductor asignado correctamente al dispositivo ${deviceName}`,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Error al asignar conductor: ${error.response?.data?.message || error.message}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async assingCommandToDevice(deviceName: string, commandDescription: string) {
    const headers = {
      Authorization: `Bearer ${this.TRACCAR_AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    };
    try {
      const deviceResponse = await axios.get(
        `${this.TRACCAR_API_URL}/devices`,
        { headers },
      );
      const devices = deviceResponse.data;
      const device = devices.find((device: any) => device.name === deviceName);

      if (!device) {
        throw new HttpException(
          `El dispositivo ${deviceName} no fue encontrado`,
          HttpStatus.NOT_FOUND,
        );
      }

      const deviceIdNumber = device.id;

      const commandResponse = await axios.get(
        `${this.TRACCAR_API_URL}/commands`,
        { headers },
      );
      const commands = commandResponse.data;
      const command = commands.find((command: any) => command.description === commandDescription);

      if (!command) {
        throw new HttpException(
          `El comando ${commandDescription} no existe`,
          HttpStatus.NOT_FOUND,
        );
      }

      const commandIdNumber = command.id;
      console.log(commandIdNumber);
      console.log(deviceIdNumber);
      
      

      await axios.post(
        `${this.TRACCAR_API_URL}/permissions`,
        {
          deviceId: deviceIdNumber,
          commandId: commandIdNumber,
        },
        { headers },
      );

      await axios.post(
        `${this.TRACCAR_API_URL}/commands/send`,
        {
          deviceId: deviceIdNumber,
          id: commandIdNumber,
        },
        { headers },
      );

      return {
        success: true,
        message: `Comando asignado correctamente al dispositivo ${deviceName}`,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Error al asignar conductor: ${error.response?.data?.message || error.message}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
