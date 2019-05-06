import { Component } from '@angular/core';
import { AsistenciaService } from './services/asistencia.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  alumno:any = {
    nombre:'CIMA',
    apellido:'Asistencia',
    descripcion:'INSTITUCIÓN EDUCATIVA CIMA',
    aula:'CIMA'
  }

  codigo:string='';
  show:boolean = false;

  constructor(
    private asistencia:AsistenciaService
  ){
     window.addEventListener('keyup',(e:any)=>{
      if(!isNaN(e.key)){this.codigo += e.key;}
      if(e.key=='Enter'){
        console.log(this.codigo);
        this.alumno = this.asistencia.getAlumno(this.codigo);
        this.codigo='';
      } 
      if(e.ctrlKey && e.altKey && e.keyCode==71){
        this.asistencia.postearAsistencias()
        .subscribe(res=>{
          if (res){
            this.show=true;
            setTimeout(() => {
              this.show = false;
            }, 2500);
            this.alumno = {
              nombre: 'CIMA',
              apellido: 'Asistencia',
              descripcion: 'INSTITUCIÓN EDUCATIVA CIMA',
              aula: 'CIMA'
            }
            console.log('ASISTENCIAS ENVIADAS AL SERVIDOR');
          }
        })         
      }     
    })
  }
  
}
