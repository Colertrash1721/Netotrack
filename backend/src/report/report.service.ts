import { Injectable } from '@nestjs/common';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { PrinterService } from 'src/printer/printer.service';
import { CreateReportDTO } from './DTO/create-report.DTO';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ReportService {
  constructor(private readonly printer: PrinterService) {}
  async createReport(reportData: CreateReportDTO, files: any): Promise<PDFKit.PDFDocument> {
    const newDate = {
      dateReport: reportData.dateReport?.split('T')[0],
      dateColocation: reportData.dateColocation?.split('T')[0],
      dateTravel: reportData.dateTravel?.split('T')[0],
      dateArrival: reportData.dateArrival?.split('T')[0],
      openingDate: reportData.openingDate?.split('T')[0],
    };
    const imageSections = {
      colocacion: files['files.colocacion']?.[0],
      viaje: files['files.viaje'],
      llegada: files['files.llegada']?.[0],
      apertura: files['files.apertura']?.[0],
    };

    // Función para convertir imágenes a base64
    const processImage = (file) => {
      if (!file) return null;
      // Para archivos en memoria (Multer)
      if (file.buffer) {
        return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }
      // Para archivos en disco (opcional)
      if (file.path) {
        const buffer = fs.readFileSync(file.path);
        return `data:${file.mimetype};base64,${buffer.toString('base64')}`;
      }
      return null;
    };

    // Procesar todas las imágenes
    const images = {
      colocacion: files.colocacion?.[0] ? processImage(files.colocacion[0]) : null,
      viaje: files.viaje?.map(processImage) || [],
      llegada: files.llegada?.[0] ? processImage(files.llegada[0]) : null,
      apertura: files.apertura?.[0] ? processImage(files.apertura[0]) : null,
    };

    console.log('Imágenes procesadas:', images);

    const docDefinition: TDocumentDefinitions = {
      content: [
        {
          text: 'INFORME DE COLOCACIÓN, VIAJE, LLEGADA A DESTINO Y APERTURA DEL PRECINTO ELECTRÓNICO\n\n',
          style: 'header',
        },
        {
          columns: [
            {
              text: [
                `Fecha: ${newDate.dateReport}\n Número de Precinto: ${reportData.numberEnclosure}\n Unidad de Transporte: ${reportData.transportUnit}\n Transportista: ${reportData.tranportist}\n Conductor: ${reportData.driverName}\n Origen: ${reportData.origin} \nDestino: ${reportData.destination} \n\n`,
              ],
              alignment: 'justify',
            },
            [
              {
                text: 'ESC Group',
                alignment: 'right',
                color: 'green',
                fontSize: 16,
                margin: [10, 0, 10, 5],
              },
              {
                qr: 'https://blue-cliff-0a10c571e.6.azurestaticapps.net',
                fit: 100,
                alignment: 'right',
                margin: [10, 0, 0, 10],
              },
            ],
          ],
        },
        {
          text: '1. Colocación del Precinto Electrónico',
          style: 'subheader',
        },
        {
          text: `Fecha: ${newDate.dateColocation} \nUbicación: ${reportData.origin} \nResponsable de Instalación: ${reportData.installationManager} \nDescripción: Se realizó la colocación del precinto electrónico en la unidad de transporte, verificando su correcto funcionamiento y asegurando su sellado.\n\n`,
        },
        images.colocacion ? { image: images.colocacion, width: 150, height: 150, margin: [0, 10, 0, 10] } : {text: ''},
        {
          text: '\n2. Seguimiento del viaje',
          style: 'subheader',
        },
        `Fecha de Salida: ${newDate.dateTravel} \nPuntos de Control:`,
        images.viaje.length > 0 ? {
          columns: images.viaje.map(img => ({
            image: img,
            width: 150,
            height: 150,
            margin: [0, 10, 0, 10]
          }))
        } : {text: ''},
        `Observaciones: ${reportData.TravelObservation}`,
        {
          text: '3. Llegada a Destino',
          style: 'subheader',
        },
        `Fecha de Llegada: ${newDate.dateArrival} \nUbicación: ${reportData.destination} \nRecepcionista: ${reportData.recepcionist} \nCondiciones de la Carga: ${reportData.productCondition}`,
        images.llegada ? 
        { 
          image: images.llegada, 
          width: 150, 
          height: 150, 
          margin: [0, 10, 0, 10] 
        } : {text: ''},
        {
          text: '\n4. Apertura del Precinto Electrónico',
          style: 'subheader',
        },
        `Fecha de colocacion: ${newDate.openingDate} \nUbicación: ${reportData.destination} \nResponsable de Apertura: ${reportData.openingManager}`,
        `Observaciones: ${reportData.openingObservation}`,
        images.apertura ? 
        { 
          image: images.apertura, 
          width: 150, 
          height: 150, 
          margin: [0, 10, 0, 10] 
        } : {text: ''},
        {
          text: '\n\nConclusión',
          style: 'subheader',
        },
        {
          text: 'Se ha completado el proceso de colocación, seguimiento, llegada a destino y apertura del precinto electrónico de forma satisfactoria. La carga ha sido entregada en las condiciones acordadas.',
          pageBreak: 'after',
        },
        {
          columns: [
            {
              text: 'Firma del Transportista:\n\n ___________________________',
              alignment: 'left',
              margin: [0, 300, 0, 0],
            },
            {
              text: 'Firma del Recepcionista:\n\n ___________________________',
              alignment: 'right',
              margin: [0, 300, 0, 0],
            },
          ],
        },
        {
          text: '\nFirma del destinatario: \n\n _______________________',
          alignment: 'center',
        },
        {
          text: 'Nota: Este informe es un documento confidencial y propiedad de ESC Group. Su divulgación o uso no autorizado está prohibido.',
          fontSize: 8,
          color: 'gray',
          alignment: 'center',
          margin: [0, 10, 0, 0],
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
        },
        subheader: {
          fontSize: 14,
          bold: true,
          alignment: 'center',
        },
      },
    };
    return this.printer.createPdf(docDefinition);
  }
}
