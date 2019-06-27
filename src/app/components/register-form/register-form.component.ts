import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SnotifyService } from 'ng-snotify';
import { User } from '../../models/user.model'
import { ClientsService } from '../../services/clients.service';
import { Constants } from '../../services/constants';

@Component({
  selector: 'register-form',
  templateUrl: './register-form.component.html',
  providers: [ClientsService]
})

export class RegisterFormComponent implements OnInit {
  private TITLE = 'Registro';
  public EMPTY_FIELD: string;
  public IDENTIFICATION_INVALID: string;
  public client: User;
  public clients: Array<User> = [];
  public registerForm: FormGroup;
  public isSubmitted: boolean = false;
  private selectedDate: any;
  public minDate: any;
  private notificationsConfig = {
    timeout: 4000,
    showProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    position: 'rightTop'
  };

  constructor(
    private formBuilder: FormBuilder,
    private clientsService: ClientsService,
    private snotifyService: SnotifyService
  ) {
    this.getClients();
    this.client = new User(null, null, null, null);
    this.EMPTY_FIELD = Constants.EMPTY_FIELD;
    this.IDENTIFICATION_INVALID = Constants.IDENTIFICATION_INVALID;
  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      identification: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      birthdate: ['', Validators.required]
    });
  }

  /**
   * Método que trae los controles del formulario
   */
  get formControls() {
    return this.registerForm.controls;
  }

  /**
   * Método que se ejecuta cuando se da click en botón de "Registrarme"
   */
  onRegister() {
    this.isSubmitted = true;
    if (this.registerForm.invalid) {
      return;
    } else {
      let foundClient: User;
      this.buildClientObject();
      foundClient = this.findClient(this.clients, this.client.identification);

      if (foundClient.identification) {
        this.resetRegisterForm(this.client);
        this.snotifyService.error(Constants.IDENTIFICATION_EXISTS, this.TITLE, this.notificationsConfig);
      } else {
        this.saveClient(this.client);
      }
    }
  }

  /**
   * Método que consume servicio que trae los clientes
   */
  getClients() {
    this.clientsService
      .getClients()
      .subscribe(data => {
        this.clients = this.transformClientsData(data);
      }, err => {
        console.error(err);
        this.snotifyService.error(Constants.SERVER_ERROR, this.TITLE, this.notificationsConfig);
      });
  }

  /**
   * Método que se encarga de consumir servicio para guardar un cliente
   * @param client 
   */
  saveClient(client: User) {
    this.clientsService
      .saveClient(client)
      .subscribe(res => {
        this.clients.push(client);
        this.isSubmitted = false;
        this.registerForm.reset();
        this.snotifyService.success(Constants.REGISTER_SUCCESS, this.TITLE, this.notificationsConfig);
      }, err => {
        console.error(err);
        this.snotifyService.error(Constants.REGISTER_ERROR, this.TITLE, this.notificationsConfig);
      });
  }

  /**
   * Mètodo que se encarga de llenar toda la información del objeto client o cliente
   */
  buildClientObject() {
    let birthdate = `${this.registerForm.value.birthdate.day}-${((this.registerForm.value.birthdate.month > 0 && this.registerForm.value.birthdate.month < 9) ? '0' : '')}${this.registerForm.value.birthdate.month}-${this.registerForm.value.birthdate.year}`;
    this.selectedDate = this.registerForm.value.birthdate;
    this.client = new User(
      (this.registerForm.value.identification ? this.registerForm.value.identification.toString() : null),
      (this.registerForm.value.firstname ? this.registerForm.value.firstname : null),
      (this.registerForm.value.lastname ? this.registerForm.value.lastname : null),
      birthdate
    );
  }

  /**
   * Método que se encarga de trasformar la información de los clientes ya que viene en un objeto
   * @param data 
   */
  transformClientsData(data): Array<User> {
    let clients: Array<User> = [];
    for (const key in data) {
      let element = data[key];
      let client = new User(
        (element.identification ? element.identification : null),
        (element.name ? element.name : null),
        (element.lastname ? element.lastname : null),
        (element.birthdate ? element.birthdate : null)
      );

      clients.push(client);
    }
    return clients;
  }

  /**
   * Método que busca un cliente con base en su identificación
   * @param clients 
   * @param identification 
   */
  findClient(clients: Array<User>, identification: string): User {
    let index = clients.findIndex(client => client.identification === identification);
    let client = new User(null, null, null, null);

    if (index > 0) {
      client = clients[index];
    }

    return client;
  }

  /**
   * Método que se encarga de hacer reset al formulario
   * @param client 
   */
  resetRegisterForm(client: User) {
    this.registerForm.reset({
      identification: '',
      firstname: client.firstname,
      lastname: client.lastname,
      birthdate: this.selectedDate
    });
  }
}