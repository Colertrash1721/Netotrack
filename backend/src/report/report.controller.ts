import { Controller, Post, Res, Body, UploadedFiles, UseInterceptors, HttpStatus } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ReportService } from './report.service';
import { CreateReportDTO } from './DTO/create-report.DTO';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { report } from 'process';

@Controller('api/report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async createReport(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('report') reportDataString: string,
    @Res() response: Response,
  ) {
    try {
      // 1. Validar que exista el campo report
      if (!reportDataString) {
        return response.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'El campo "report" es requerido en el body',
        });
      }

      // 2. Parsear y validar estructura JSON
      let reportData: CreateReportDTO;
      try {
        reportData = JSON.parse(reportDataString);
        reportData = plainToClass(CreateReportDTO, reportData);
        console.log('Datos de reporte:', reportData);
        console.log('Archivos recibidos:', reportData.dateReport.split('T')[0]);
        
        
        
        const errors = await validate(reportData);
        if (errors.length > 0) {
          return response.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: 'Datos de reporte inválidos',
            errors: errors.map(err => ({
              property: err.property,
              constraints: err.constraints,
            })),
          });
        }
      } catch (parseError) {
        return response.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Formato JSON inválido en el campo report',
          error: parseError.message,
        });
      }

      // 3. Validación de campos requeridos
      if (!reportData.dateReport || !reportData.numberEnclosure) {
        return response.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Los campos dateReport y numberEnclosure son requeridos',
        });
      }

      // 4. Depuración: Verificar archivos recibidos
      console.log('Archivos recibidos:', files);
      
      // 5. Organizar archivos correctamente
      const organizedFiles = {};
      files.forEach(file => {
        // El fieldname viene como "files.colocacion", "files.viaje", etc.
        const section = file.fieldname.replace('files.', '');
        if (!organizedFiles[section]) {
          organizedFiles[section] = [];
        }
        organizedFiles[section].push(file);
      });

      console.log('Archivos organizados:', organizedFiles);

      // 6. Generar PDF
      const pdfDoc = await this.reportService.createReport(reportData, organizedFiles);

      // 7. Configurar respuesta
      response.setHeader('Content-Type', 'application/pdf');
      response.setHeader('Content-Disposition', `attachment; filename=reporte_${reportData.numberEnclosure}.pdf`);
      
      pdfDoc.pipe(response);
      pdfDoc.end();

    } catch (error) {
      console.error('Error en el controlador:', error);
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno al generar el reporte',
        error: error.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
      });
    }
  }
}