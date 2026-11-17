import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OrderService {
  items: string[] = [];
  code = '';

  gerarCodigo(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  create(items: string[], code: string = this.gerarCodigo()) {
    this.items = items;
    this.code = code;
  }
}
