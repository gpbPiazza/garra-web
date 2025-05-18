import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


export interface ErrorInfo {
  message: string;
  code: string;
}

export interface Response<T> {
  data?: T;
  errors?: ErrorInfo[];
}

export interface GenerateMinutaResp {
  tokens_not_found: string[];
  minuta_html: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  generateMinuta(
    file: File, 
    isTransmitenteOverqualified = false, 
    isAdquirenteOverqualified = false
  ): Observable<Response<GenerateMinutaResp>> {
    const formData = new FormData();
    formData.append('ato_consultar_pdf', file);
    formData.append('is_transmitente_overqualified', isTransmitenteOverqualified ? 'true' : 'false');
    formData.append('is_adquirente_overqualified', isAdquirenteOverqualified ? 'true' : 'false');
    
    return this.http.post<Response<GenerateMinutaResp>>(`${this.baseUrl}/api/v1/generator/minuta`, formData);
  }
}