import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  generateMinuta(
    file: File, 
    isTransmitenteOverqualified: boolean = false, 
    isAdquirenteOverqualified: boolean = false
  ): Observable<string> {
    const formData = new FormData();
    formData.append('ato_consultar_pdf', file);
    formData.append('is_transmitente_overqualified', isTransmitenteOverqualified ? 'true' : 'false');
    formData.append('is_adquirente_overqualified', isAdquirenteOverqualified ? 'true' : 'false');
    
    return this.http.post<string>(
      `${this.baseUrl}/api/v1/generator/minuta`, 
      formData, 
      { responseType: 'text' as 'json' }
    );
  }
}