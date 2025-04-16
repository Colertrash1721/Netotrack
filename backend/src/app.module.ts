import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceModule } from './device/device.module';
import { RoutesModule } from './routes/routes.module';
import { Routes } from './routes/entities/route.entity';
import { Login } from './auth/auth.entity';
import { Concurrent } from './routes/entities/concurrent.entity';
import { GeofencesModule } from './geofences/geofences.module';
import { ReportModule } from './report/report.module';
import { PrinterModule } from './printer/printer.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'mysql',
      username: 'root',
      password: 'root',
      port: 3306,
      database: 'netotrack',
      entities: [Routes, Login, Concurrent],
      synchronize: false,
    }),
    AuthModule,
    DeviceModule,
    RoutesModule,
    GeofencesModule,
    ReportModule,
  ]
})
export class AppModule {}
