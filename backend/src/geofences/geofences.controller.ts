import {
  Controller,
  Get,
  Param
} from '@nestjs/common';
import { GeofencesService } from './geofences.service';

@Controller('api/geofences')
export class GeofencesController {
  constructor(private readonly geofencesService: GeofencesService) {}

  @Get()
  findAll() {
    return this.geofencesService.findAll();
  }

  @Get(':latitud/:longitud')
  findOne(
    @Param('latitud') latitud: string,
    @Param('longitud') longitud: string,
  ) {
    return this.geofencesService.findOne(latitud, longitud);
  }
}
