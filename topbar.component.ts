import { Component, Input } from '@angular/core';
import { IonButtons, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

/** Barra superior padrão. As ações da página entram por <ng-content>. */
@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent {
  @Input() titulo = 'Cardápio RU';
}
