import { Injectable } from '@nestjs/common';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

const fonts = {
  Roboto: {
    normal: 'src/fonts/static/Roboto-Regular.ttf',
    bold: 'src/fonts/static/Roboto-Bold.ttf',
    italics: 'src/fonts/static/Roboto-Italic.ttf',
    bolditalics: 'src/fonts/static/Roboto-MediumItalic.ttf',
  },
};

@Injectable()
export class PrinterService {
    private printer = new PdfPrinter(fonts);
    createPdf(docDefinition: TDocumentDefinitions) {
        return this.printer.createPdfKitDocument(docDefinition)
    }
}
