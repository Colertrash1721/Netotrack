// create-report.dto.ts
export class CreateReportDTO {
  dateReport: string;
  numberEnclosure: string;
  transportUnit: string;
  tranportist: string;
  driverName: string;
  origin: string;
  destination: string;
  dateColocation: string;
  location: string;
  installationManager: string;
  dateTravel: string;
  TravelObservation: string;
  dateArrival: string;
  locationDestination: string;
  recepcionist: string;
  productCondition: string;
  openingDate: string;
  locationOpening: string;
  openingManager: string;
  openingObservation: string;
}

export class CreateReportFilesDTO {
  report: string;
  files: {
    colocacion?: Express.Multer.File[];
    viaje?: Express.Multer.File[];
    llegada?: Express.Multer.File[];
    apertura?: Express.Multer.File[];
  };
}