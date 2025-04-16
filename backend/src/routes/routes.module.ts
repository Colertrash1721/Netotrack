import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Routes } from './entities/route.entity';
import { Concurrent } from './entities/concurrent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Routes, Concurrent])],
  controllers: [RoutesController],
  providers: [RoutesService],
})
export class RoutesModule {}