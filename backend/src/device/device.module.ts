import { Module } from '@nestjs/common';
import { TraccarService  } from './device.service';
import { DeviceController } from './device.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Routes } from 'src/routes/entities/route.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Routes])],
  providers: [TraccarService ],
  controllers: [DeviceController]
})
export class DeviceModule {}
