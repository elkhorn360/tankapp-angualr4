import {Component, OnInit} from '@angular/core';
import * as nipplejs from 'nipplejs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';

  connection: any = null;
  btnText: string;
  ip: string;
  led: string;
  connected: boolean;

  ngOnInit(): void {
    this.btnText = 'Connect';
    this.ip = '192.168.1.8';
    this.led = '0';

    let options = {
      zone: document.getElementById('zone_joystick'),                  // active zone
      mode: 'static',
      position: {left: '50%', top: '50%'},
      color: 'red'           // transition time joystick in
    };

    let manager = nipplejs.create(options);
    let starPosition = null;
    let that = this;
    manager.on('start end', function (evt, data) {
      //console.log(evt.type);
      starPosition = data.position;
      let x = data.position.x - starPosition.x;
      let y = starPosition.y - data.position.y;
      that.sendCommand(x, y);
      console.log(data.position);
    }).on('move', function (evt, data) {
      let x = data.position.x - starPosition.x;
      let y = starPosition.y - data.position.y;
      //console.log(x + "   " + y);
      that.sendCommand(x, y);
    })
  }

  sendCommand(x, y) {
    var forward = 512 + Math.round(((y / 100.0) * 1024.0));
    var diff = Math.round(((x / 100.0) * 1024.0));
    console.log(Math.max(0, Math.min(1024, (forward - diff))) + "-" + Math.max(0, Math.min(1024, (forward + diff))) + "-" + this.led);
    this.connection.send(Math.max(0, Math.min(1024, (forward - diff))) + "-" + Math.max(0, Math.min(1024, (forward + diff))) + "-" + this.led);
  };

  connectTank() {
    this.btnText = "Connecting...";
    this.connection = new WebSocket('ws://' + this.ip + ':81/', ['arduino']);
    let that = this;
    this.connection.onopen = function () {
      that.connected = true;
      that.btnText = "Connected";
      // this.connection.send('Connect ' + new Date());
    };
    this.connection.onerror = function (error) {
      that.btnText = "Connect";
      that.connected = false;
      console.log('WebSocket Error ', error);
    };
    this.connection.onmessage = function (e) {
      console.log('Server: ', e.data);
    };
    this.connection.onclose = function (e) {
      that.btnText = "Connect";
      that.connected = false;
      console.log('Server: ', e.data);
    };
  }

  toggleConnect() {
    if (this.connected) {
      this.btnText = "Connect";
      this.connection.close();
      this.connected = false;
    } else {
      this.connectTank();
    }
  }

  toggleLED() {
    if (this.led == '0') {
      this.led = '1';
    } else {
      this.led = '0';
    }
    this.connection.send('512-512-' + this.led);
  }
}
