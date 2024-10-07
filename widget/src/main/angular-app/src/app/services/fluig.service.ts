import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { PoComboOptionGroup, PoTableColumn, PoTableDetail, PoTagType } from '@po-ui/ng-components';
import { User } from '../interfaces/user';
import { WINDOW } from 'ngx-window-token';
import { IWCMAPI } from '../interfaces/IWCMAPI';

@Injectable()
export class FluigService {

WCMAPI!: IWCMAPI;
  
body?: Object = {}
httpOptions: any;
      
      constructor(
        @Inject(WINDOW) private _window: Window,
                private http: HttpClient,
      ) { 
        this.WCMAPI = this._window.WCMAPI;
        this.httpOptions = environment.development ? {
        
        headers: new HttpHeaders({
          'Authorization': 'Bearer eyJraWQiOiI1OGM3NjQzZi03NTQwLTQ4Y2YtOGVhYy01NDhiM2I4MGYxOTMiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJ1c2VyLGFkbWluIiwidGVuYW50IjoxLCJ1c2VyVGVuYW50SWQiOjMsInNpdGVDb2RlIjoiRmx1aWciLCJzaXRlSWQiOjEsInVzZXJUeXBlIjowLCJ1c2VyVVVJRCI6IjgwYTQxMGMwLTY5M2EtNGY1NC04N2EzLTkzN2YyZjQ1Mjg1ZiIsInRlbmFudFVVSUQiOiI1OGM3NjQzZi03NTQwLTQ4Y2YtOGVhYy01NDhiM2I4MGYxOTMiLCJsYXN0VXBkYXRlRGF0ZSI6MTcyNzk2OTE1NzAwMCwidXNlclRpbWVab25lIjoiQW1lcmljYS9TYW9fUGF1bG8iLCJleHAiOjE3MjgwNTEyOTAsImlhdCI6MTcyODA1MDA5MCwiYXVkIjoiZmx1aWdfYXV0aGVudGljYXRvcl9yZXNvdXJjZSJ9.Mw-tCeJdIEHNrVM-7qk_UNdcU5Qm68HS1y0A6VcAuD62kup5_jA0Gi6xlE4Uk1t216b4TCPBgsAQAGP5nEuM6LdSHwA-7t_1xS4TVcZu_tGlH-QnLV1mYvB07Nv4fB1oOXlcMjHiN-s8A8oo9Am7QOHgwHQVka1iiEubBHdGK3c2U-qMtWVqeMlKcYLLRl0c0l_MNBrm7BD2joolCLOpfyjpChbn1fZ26WE9G60di9Td3aZdUoX4Pk4GvWnk8whDEBJhd8rLffg1f_1kqk_XuUke1bzcOjyF81R0dqYfffYLO6kfeHrf2OhRlmVNRlrXHv6khcjOHg8OPgNVBrcLTQ',
        })
      } : undefined; }


  public getDataset(): Observable<any> {
        const url = '/api/public/ecm/dataset/datasets/';
        
       
          this.body = {
            "name": 'ds_filialProjetosGeniality',
            "constraints": [],
          }

        return this.http.post(url, this.body, this.httpOptions);
      }

  public getFilial(): Observable<any> {
        const url = '/api/public/ecm/dataset/datasets/';
        
         this.body = {
            "name": "ds_zoom_estab_cnpj",
            "constraints": [],
        }
        return this.http.post(url, this.body, this.httpOptions);
      }

public incluirFilial(payload: any): Observable<any> {
  const url = '/ecm-forms/api/v2/cardindex/664732/cards';

        return this.http.post(url, payload, this.httpOptions);
      }



    public getCurrent(userLogin: string): Observable<any> {
     
      const url = `/collaboration/api/v3/users/${userLogin}`
      
      return this.http.get(url, this.httpOptions)
   
    }
    
     
    public getUserLogin(): string {
      return this.WCMAPI.userLogin;
    }

    public getListUser(): Observable<any> {
      const url = `/collaboration/api/v3/users/?pageSize=1000`
      return this.http.get(url, this.httpOptions)
    } 

   public getGroupUser(userLogin: string): Observable<any>{
    const url = `/portal/api/rest/wcm/service/user/findAllGroupsByUser?space=&login=${userLogin}`
    return this.http.get(url, this.httpOptions)
   }

   public getRoleUser(userLogin: string): Observable<any>{
    const url = `/portal/api/rest/wcm/service/user/findUserRoles?space=&login=${userLogin}`
    return this.http.get(url, this.httpOptions)
   }
   public updateUser(payload: any): Observable<any> {
    const url = '/ecm/api/rest/ecm/user/update';
    return this.http.put(url, payload, this.httpOptions);
  }
  public getUserDestino(userLogin: string): Observable<any> {
     
    const url = `/ecm/api/rest/ecm/user/get/${userLogin}`
    
    return this.http.get(url, this.httpOptions)
 
  }

  public getUserBase(userLogin: string): Observable<any> {
     
    const url = ` /ecm/api/rest/ecm/user/get/${userLogin}`
    
    return this.http.get(url, this.httpOptions)
 
  }
  public transferenciaProcesso(payload: any): Observable<any> {
    const url = '/ecm/api/rest/ecm/outstandingTasksTransfer/transfer/';
    return this.http.post(url, payload, this.httpOptions);
  }
  public createSubstitute(payload: any): Observable<any> {
    const url = '/ecm/api/rest/ecm/colleaguereplacement/create';
    return this.http.post(url, payload, this.httpOptions);
  }
       
}

declare global {
  interface Window {
    WCMAPI: IWCMAPI;
  }
}

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
