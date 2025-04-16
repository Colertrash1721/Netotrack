import { IsString } from "class-validator";

export class CreateRouteDto {
    @IsString()
    rute_Name: string

    @IsString()
    device_Name: string

    @IsString()
    Startlatitud: string

    @IsString()
    Startlongitud: string

    @IsString()
    Endlatitud: string

    @IsString()
    Endlongitud: string
}
