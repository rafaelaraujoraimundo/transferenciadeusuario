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
          'Authorization': 'Bearer eyJraWQiOiI1OGM3NjQzZi03NTQwLTQ4Y2YtOGVhYy01NDhiM2I4MGYxOTMiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJ1c2VyLGFkbWluIiwidGVuYW50IjoxLCJ1c2VyVGVuYW50SWQiOjMsInNpdGVDb2RlIjoiRmx1aWciLCJzaXRlSWQiOjEsInVzZXJUeXBlIjowLCJ1c2VyVVVJRCI6IjgwYTQxMGMwLTY5M2EtNGY1NC04N2EzLTkzN2YyZjQ1Mjg1ZiIsInRlbmFudFVVSUQiOiI1OGM3NjQzZi03NTQwLTQ4Y2YtOGVhYy01NDhiM2I4MGYxOTMiLCJsYXN0VXBkYXRlRGF0ZSI6MTcyNzk2OTE1NzAwMCwidXNlclRpbWVab25lIjoiQW1lcmljYS9TYW9fUGF1bG8iLCJleHAiOjE3Mjg0MTcxMzUsImlhdCI6MTcyODQxNTkzNSwiYXVkIjoiZmx1aWdfYXV0aGVudGljYXRvcl9yZXNvdXJjZSJ9.qpSMRHjcecvFIWC5edtwAqB2uZpeWN5Dz0GB04-S-URbaeNrz-PbB9ir0ya2YGmRoGwrMPEWPfC9zZ75xszZbnoFVlX5VkBGFiTfuB5_tBUc1vDRIOGu9djjruuogEGzQv47VLoS-JafWv-tQQ-sYGV09LWrLF0M8A6XlQad6J90nE6IS1O39HpCwFJTpeUSluH5zqvjIdQtEWz8zeHX0Fs5zLg4DvtB2mhh8OsM6HEOsUd75D6p0OqYZtPuKb-Dyh79T5ug_LcSpNZe5GixqoYE6r0B09mMSV4XMmJdgfUWNMOirLFuf4M-NuKkFtrH_vLXn3P2dmjAnIWVDOE4SQ',
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
