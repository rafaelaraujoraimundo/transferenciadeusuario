import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FluigService } from '../../services/fluig.service';
import {
  PoComboOption,
  PoComboOptionGroup,
  PoDialogService,
  PoNotificationService,
  PoTableColumn,
  PoTagType
} from '@po-ui/ng-components';
import { Router } from '@angular/router';
import { User } from '../../interfaces/user';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-list-cards',
  templateUrl: './list-cards.component.html',
  styleUrls: ['./list-cards.component.css']
})
export class ListCardsComponent implements OnInit {
  columns: Array<any> = new Array();
  public items: Array<PoComboOption> = [];
  userLogin!: string;
  user!: User;
  userDestino!: any; 
  userBase!: any; 
  user$!: Observable<User>;
  citiesOptions!: Array<PoComboOptionGroup>;
  city!: string;
  ListaGruposUsuarioBase: Array<any> =  new Array();
  ListaGruposUsuarioDestino: Array<any> =  new Array();
  ListaRoleUserBase: Array<any> =  new Array();
  ListaRoleUserDestino: Array<any> =  new Array();

  form?: FormGroup;

  constructor(
    private fb: FormBuilder,
    private fluigService: FluigService,
    private poNotification: PoNotificationService,
    private poDialog: PoDialogService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.userLogin = this.fluigService.getUserLogin();
    this.getUser();
    this.getUserList() ;
    this.createForm();
    
    };

    

    createForm() {
      this.form = this.fb.group({
        usuarioBase: [null, Validators.required],  // Campo obrigatório
        usuarioDestino: [null, Validators.required],   // Será preenchido pelo usuário
        solicitacaoDe: [1],  // Campo novo
        solicitacaoAte: [99999999],  // Campo novo
        solicitacoesAbertas: [true],  // Checkbox novo
        solicitacoesPendentes: [true],
        createSubstitute: [false,]  // Checkbox novo
      });
    }
    
    onSubmit(){
      if(this.form!.valid){
        this.poDialog.confirm({
          title: 'Confirm',
          message: `Confirma a transferencia dos Processos, groups e Papéis do Usuario ${this.form!.value.usuarioBase} para ${this.form!.value.usuarioDestino}`,
          confirm: () => this.confirmaTransferencia()
        });
      }
    }

    confirmaTransferencia() {
      if (this.form!.valid) {
        const gruposPayload = this.combinarGrupos();
        const rolesPayload = this.combinarRoles();
    
        this.obterUserDestino(this.form!.value.usuarioDestino)
          .subscribe({
            next: (res: any) => {
              this.userDestino = this.criarUser(res);
              const payload = this.criarPayload(gruposPayload, rolesPayload);
    
              this.atualizarUser(payload)
                .subscribe({
                  next: () => {
                    this.poNotification.success('Usuário atualizado com sucesso!');
                    this.obterUserBase(this.form!.value.usuarioBase)
                      .subscribe({
                        next: (response) => {
                          this.userBase = this.criarUser(response);
                          if (this.form!.value.createSubstitute) {
                            this.confirmaSubstituto();
                          }
                          const transferPayload = this.criarTransferPayload();
                          this.transferirProcesso(transferPayload);
                        },
                        error: (err) => this.tratarErro('Erro ao atualizar o usuário', err)
                      });
                  },
                  error: (err) => this.tratarErro('Erro ao atualizar o usuário', err)
                });
            },
            error: (err: any) => this.tratarErro('Erro ao carregar o usuário', err)
          });
      }
    }
    
    combinarGrupos() {
      const gruposUnidos = [...this.ListaGruposUsuarioBase, ...this.ListaGruposUsuarioDestino]
        .filter((value, index, self) => self.findIndex(v => v.key === value.key) === index);
      return gruposUnidos.map(grupo => ({ key: grupo.key, value: grupo.value }));
    }
    
    combinarRoles() {
      const rolesUnidos = [...this.ListaRoleUserBase, ...this.ListaRoleUserDestino]
        .filter((value, index, self) => self.findIndex(v => v.key === value.key) === index);
      return rolesUnidos.map(role => ({ key: role.key, value: role.value }));
    }
    
    obterUserDestino(usuarioDestino: string) {
      return this.fluigService.getUserDestino(usuarioDestino);
    }
    
    obterUserBase(usuarioBase: string) {
      return this.fluigService.getUserBase(usuarioBase);
    }
    
    criarUser(res: any) {
      return {
        email: res.email,
        name: res.description,
        alias: res.login,
        userCode: res.userCode,
        lastName: res.lastName,
        firstName: res.firstName
      };
    }
    
    criarPayload(gruposPayload: any, rolesPayload: any) {
      return {
        formData: {
          editLogin: this.userDestino.alias,
          email: this.userDestino.email,
          data: "",
          group: JSON.stringify(gruposPayload),
          role: JSON.stringify(rolesPayload),
          permissions: "",
          firstName: this.userDestino.firstName,
          lastName: this.userDestino.lastName,
        },
        config: {
          validateFields: [{ key: "email" }]
        }
      };
    }
    
    atualizarUser(payload: any) {
      return this.fluigService.updateUser(payload);
    }
    
    criarTransferPayload() {
      return {
        userTo: this.userDestino.userCode,
        userFrom: this.userBase.userCode,
        transferActiveDocuments: false,
        transferMyDocumentsInApproval: false,
        transferPendingWorkflow: this.form!.value.solicitacoesPendentes,
        transferOpenWorkflow: this.form!.value.solicitacoesAbertas,
        transferApprovers: false,
        transferApprovals: false,
        transferDocumentSecurity: false,
        instanceIdInitial: this.form!.value.solicitacaoDe,
        instanceIdFinal: this.form!.value.solicitacaoAte,
        documentIdInitial: 0,
        documentIdFinal: 9999999
      };
    }
    
    transferirProcesso(transferPayload: any) {
      this.fluigService.transferenciaProcesso(transferPayload)
        .subscribe({
          next: (response) => {
            this.poNotification.success('Transferência de processos realizada com sucesso!');
            this.poDialog.alert({ title: 'Alerta de Transferencia de Processos', message: response });
          },
          error: (err) => this.tratarErro('Erro ao realizar a transferência', err)
        });
    }
    
    confirmaSubstituto() {
      const dataAtual = this.obterDataAtual();
      const payload = this.criarSubstitutoPayload(dataAtual);
    
      this.fluigService.createSubstitute(payload)
        .subscribe({
          next: (response) => {
            this.poNotification.success('Substituto criado com sucesso!');
            console.log('Resposta da API:', response);
          },
          error: (err) => this.tratarErro('Erro ao criar substituto', err)
        });
    }
    
    obterDataAtual() {
      const hoje = new Date();
      const dia = String(hoje.getDate()).padStart(2, '0');
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const ano = hoje.getFullYear();
      return `${dia}/${mes}/${ano}`;
    }
    
    criarSubstitutoPayload(dataAtual: string) {
      return {
        formData: {
          colleagueReplacementId: "",
          colleagueId: this.userBase.userCode,
          colleagueName: this.userBase.name,
          replacementId: this.userDestino.userCode,
          replacementName: this.userDestino.name,
          dataInicial: dataAtual,
          dataFinal: '31/12/2099',
          processes: "",
          replacementJustify: ""
        },
        config: {
          className: "foundation.model.ColleagueReplacement",
          validateFields: [
            { key: "colleagueId" },
            { key: "replacementId" },
            { key: "dataInicial" },
            { key: "dataFinal" }
          ]
        }
      };
    }
    
    tratarErro(mensagem: string, err: any) {
      this.poNotification.error(`${mensagem}: ${err.message}`);
      console.error('Erro:', err);
    }
    

    verificaGrupos(userLogin: string, tipo: string){
      this.fluigService.getGroupUser(userLogin).subscribe(
        (response: any) => {
          if (tipo == 'usuarioBase') {
            this.ListaGruposUsuarioBase = response.content.map((val: any) => ({
              key: val.key,
              value: val.value
          
           
            }))
            //console.log(this.ListaGruposUsuarioBase)
          }
          if (tipo == 'usuarioDestino'){
            this.ListaGruposUsuarioDestino = response.content.map((val: any) => ({
              key: val.key,
              value: val.value
          
           
            }))
            //console.log(this.ListaGruposUsuarioDestino)

          }
          
        },

        (error) => {
          console.error('Erro ao consumir a API', error);
        }

      )

    }
    getGroupRoles(userLogin: string, tipo: string){
      this.getRoleUser(userLogin, tipo);
      this.verificaGrupos(userLogin, tipo)

    }

    getRoleUser(userLogin: string, tipo: string){
      
      this.fluigService.getRoleUser(userLogin).subscribe(
        (response: any) => {
          if (tipo == 'usuarioBase') {
            this.ListaRoleUserBase = response.content.map((val: any) => ({
              key: val.key,
              value: val.value
          
           
            }))
            //console.log(this.ListaRoleUserBase)
          }
          if (tipo == 'usuarioDestino'){
            this.ListaRoleUserDestino = response.content.map((val: any) => ({
              key: val.key,
              value: val.value
          
           
            }))
            //console.log(this.ListaRoleUserDestino)

          }
          
        },

        (error) => {
          console.error('Erro ao consumir a API', error);
        }

      )

    }


    getUserList() {
      this.fluigService.getListUser().subscribe(
        (response: any) => {
          this.items = response.items.map((val: any) => ({
            label: val.name,   // O campo 'name' será o label
            value: val.alias   // O campo 'alias' será o value
          }));
    
          //console.log(this.items);
        },
        (error) => {
          console.error('Erro ao consumir a API', error);
        }
      );
    }
    


    getUser() {
      // Usamos o FluigService para buscar o usuário com base no userLogin
      this.fluigService.getCurrent(this.userLogin).subscribe({
        next: (res: any) => {
          // Criamos um objeto do tipo User com base na resposta da API
          this.user = {
            email: res.email,
            name: res.name,
            alias: res.alias
          };
          //console.log('Usuário carregado:', this.user);
        },
        error: (err: any) => {
          // Tratamento de erro
          this.poNotification.error('Erro ao carregar o usuário: ' + err.error.message);
          console.log(err);
        }
      });
    }


    

}
