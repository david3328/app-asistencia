import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
declare var window: any;


@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {
  alumnos: any[];
  asistencias: any[];
  ip: String;
  API: String = 'http://intranet.cima.com.pe:3000/api/cimapersonal/asistencia/';

  constructor(private http: HttpClient) {
    this.obtenerAsistencias();
    this.getAlumnos();
    this.obtenerIP((ip) => {
      this.ip = ip;
      console.log(ip);
    })
  }

  getAlumnos() {
    this.http.get(this.API + 'listar')
      .subscribe((res: any) => this.alumnos = res.data)
  }

  getAlumno(codigo: number | string) {
    let alumno = this.alumnos.find(alumno => alumno.id == codigo)
    if (alumno) this.guardarAsistencia(alumno)
    else alumno = { nombre: 'NO ENCONTRADO', apellido: 'NO ENCONTRADO', descripcion: 'NO ENCONTRADO', aula: 'NO ENCONTRADO' }
    return alumno;

  }

  obtenerAsistencias() {
    if (localStorage.getItem('CIMA_ASISTENCIAS'))
      this.asistencias = JSON.parse(localStorage.getItem('CIMA_ASISTENCIAS'));
    else this.asistencias = []
  }

  limpiarAsistencias() {
    this.asistencias = [];
    localStorage.setItem('CIMA_ASISTENCIAS', JSON.stringify(this.asistencias));
  }

  guardarAsistencia(alumno: any) {
    alumno.fecha = new Date().toString().slice(0, 24);
    let buscarAlumno = this.asistencias.find(asistencia => asistencia.id == alumno.id)
    if (!buscarAlumno) {
      this.asistencias.push(alumno);
      localStorage.setItem('CIMA_ASISTENCIAS', JSON.stringify(this.asistencias));
    }
    console.log('ASISTENCIA INGRESADA');
  }

  postearAsistencias() {
    if (this.asistencias.length == 0)  return new Observable<boolean>(observer => observer.next(true));
    let rastreo = this.ip;
    let arrcodigos = [];
    let arrfechas = [];
    let arrcarnet = [];
    this.asistencias.forEach(el => {
      arrcodigos.push(el.id);
      arrfechas.push(el.fecha);
      arrcarnet.push(true);
    })

    let codigos = '{' + arrcodigos.join(',') + '}';
    let fechas = '{' + arrfechas.join(',') + '}';
    let carnet = '{' + arrcarnet.join(',') + '}';

    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(this.API+'insertar',
      { rastreo, codigos, fechas, carnet },
      { headers })
      .pipe(map(data => {
        if (!data['data']) return false;
        this.limpiarAsistencias();
        return true;
      }))
  }

  obtenerIP(onNewIP) {
    var myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var pc = new myPeerConnection({
      iceServers: []
    }),
      noop = function () { },
      localIPs = {},
      ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,
      key;

    function iterateIP(ip) {
      if (!localIPs[ip]) onNewIP(ip);
      localIPs[ip] = true;
    }

    //create a bogus data channel
    pc.createDataChannel("");

    // create offer and set local description
    pc.createOffer().then(function (sdp) {
      sdp.sdp.split('\n').forEach(function (line) {
        if (line.indexOf('candidate') < 0) return;
        line.match(ipRegex).forEach(iterateIP);
      });

      pc.setLocalDescription(sdp, noop, noop);
    }).catch(function (reason) {
      // An error occurred, so handle the failure to connect
    });

    //listen for candidate events
    pc.onicecandidate = function (ice) {
      if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return;
      ice.candidate.candidate.match(ipRegex).forEach(iterateIP);
    };

  }


}
