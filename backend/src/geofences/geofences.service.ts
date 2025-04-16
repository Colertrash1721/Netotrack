import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import axios, { AxiosRequestConfig } from 'axios';

@Injectable()
export class GeofencesService {
  private readonly TRACCAR_API_URL = 'http://128.85.27.70:8082/api';
  private readonly TRACCAR_AUTH_TOKEN = process.env.My_Token;

  constructor(private readonly httpService: HttpService) {}

  async findAll() {
    const url = `${this.TRACCAR_API_URL}/geofences`;
    const headers = {
      Authorization: `Bearer ${this.TRACCAR_AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    };
    const config: AxiosRequestConfig = {
      headers: headers,
    };

    try {
      const response = await axios.get(url, config,
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `No se pudo acceder a la API de Traccar ${error}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async findOne(latitud: string, longitud: string) {
    const url = `${this.TRACCAR_API_URL}/geofences`;
    const headers = {
      Authorization: `Bearer ${this.TRACCAR_AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    };
    const config: AxiosRequestConfig = {
      headers: headers,
    };

    try {
      // 1. Obtener todas las geofences desde la API de Traccar
      const response = await axios.get(url, config);
      const geofences = response.data;

      // 2. Convertir latitud y longitud a números
      const lat = parseFloat(latitud);
      const lng = parseFloat(longitud);

      const geofenceEncontrada = geofences.find((geofence) => {
        
        if (geofence.area) {
  
          return this.estaDentroDeGeofence(lat, lng, geofence.area);
        }
        return false;
      });

      if (geofenceEncontrada) {
        return geofenceEncontrada;
      } else {
        return new HttpException(
          'No se encontró ninguna geofence para las coordenadas proporcionadas',
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (error) {
      return new HttpException(
        `No se pudo acceder a la API de Traccar: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Método para verificar si una coordenada está dentro de una geofence
  private estaDentroDeGeofence(lat: number, lng: number, area: string): boolean {
    // Asumimos que el área es un polígono en formato WKT (Well-Known Text)
    // Ejemplo de área: "POLYGON((lon1 lat1, lon2 lat2, lon3 lat3, ...))"
    const coordenadas = area
      .replace('POLYGON((', '')
      .replace('))', '')
      .split(',')
      .map((coord) => {
        const [lat, lon] = coord.trim().split(' ');
        return { lat: parseFloat(lat), lng: parseFloat(lon) };
      });

    // Usar el algoritmo de ray casting para determinar si el punto está dentro del polígono
    return this.rayCasting(lat, lng, coordenadas);
  }

  // Algoritmo de ray casting para verificar si un punto está dentro de un polígono
  private rayCasting(lat: number, lng: number, polygon: { lat: number; lng: number }[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lng,
        yi = polygon[i].lat;
      const xj = polygon[j].lng,
        yj = polygon[j].lat;

      const intersect =
        yi > lat !== yj > lat &&
        lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;

      if (intersect) inside = !inside;
    }
    return inside;
  }

}