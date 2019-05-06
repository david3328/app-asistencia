import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'thumbnail'
})
export class ThumbnailPipe implements PipeTransform {

  transform(alumno:any): any {
    return alumno.nombre[0]+alumno.apellido[0]; 
  }

}
