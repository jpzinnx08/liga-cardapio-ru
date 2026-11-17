import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonButton, IonButtons, IonContent, IonHeader, IonModal, IonTitle, IonToolbar } from '@ionic/angular';
import { Prato } from '../../models';

/** Etapa de confirmação da bandeja: lista os pratos e o total antes de gravar. */
@Component({
  selector: 'app-bandeja-modal',
  standalone: true,
  imports: [IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent],
  templateUrl: './bandeja-modal.component.html',
  styleUrls: ['./bandeja-modal.component.scss'],
})
export class BandejaModalComponent {
  @Input() aberto = false;
  @Input() pratos: Prato[] = [];
  @Input() total = 0;
  @Input() enviando = false;

  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
}
