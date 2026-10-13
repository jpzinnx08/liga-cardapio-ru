import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { jsPDF } from 'jspdf';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [IonContent],
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
})
export class OrderPage implements OnInit {
  constructor(private auth: AuthService, public order: OrderService, private router: Router) {}

  get nome() { return this.auth.firstName; }

  ngOnInit() {
    if (!this.order.items.length) this.router.navigateByUrl('/menu', { replaceUrl: true });
  }

  voltar() { this.router.navigateByUrl('/menu'); }

  gerarPdf() {
    const doc = new jsPDF();
    let y = 25;
    doc.setFontSize(18); doc.text('CARDÁPIO RU', 20, y); y += 16;
    doc.setFontSize(12);
    doc.text(`Aluno: ${this.nome}`, 20, y); y += 12;
    doc.text('Pedido:', 20, y); y += 8;
    for (const item of this.order.items) { doc.text(item, 20, y); y += 7; }
    y += 6;
    doc.text(`Código do pedido: ${this.order.code}`, 20, y);
    doc.save(`pedido-${this.order.code}.pdf`);
  }
}
