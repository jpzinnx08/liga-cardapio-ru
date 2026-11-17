import { Component, Input } from '@angular/core';

/** Mostra a nota (0 a 5) em estrelas, com preenchimento parcial. */
@Component({
  selector: 'app-estrelas',
  standalone: true,
  template: `
    <span class="estrelas" role="img" [attr.aria-label]="'Nota ' + nota.toFixed(1) + ' de 5'">
      <span class="base">★★★★★</span>
      <span class="fill" [style.width.%]="percentual">★★★★★</span>
    </span>`,
  styles: [`
    .estrelas { position: relative; display: inline-block; line-height: 1; font-size: 16px; letter-spacing: 1px; }
    .base { color: #d1d5db; }
    .fill { position: absolute; left: 0; top: 0; overflow: hidden; white-space: nowrap; color: #f59e0b; }
  `],
})
export class EstrelasComponent {
  @Input() nota = 0;
  get percentual(): number { return (Math.max(0, Math.min(5, this.nota)) / 5) * 100; }
}
