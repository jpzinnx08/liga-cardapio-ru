import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OrderService {
  items: string[] = [];
  code = '';

  create(items: string[]) {
    this.items = items;
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    this.code = Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }
}
