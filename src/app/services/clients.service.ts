import { Injectable } from '@angular/core';
import { HttpClient } from  "@angular/common/http";
import { User } from '../models/user.model';


@Injectable()
export class ClientsService {
  private URL_API = 'https://testbankapi.firebaseio.com';

  constructor(
    private httpClient: HttpClient
  ) {}

  /**
   * Servicio que trae clientes
   */
  public getClients() {
    return this.httpClient.get(`${this.URL_API}/clients.json`);
  }

  /**
   * Servicio que guarda un cliente
   * @param client 
   */
  public saveClient(client: User) {
    return this.httpClient.post(`${this.URL_API}/clients.json`, client);
  }
}