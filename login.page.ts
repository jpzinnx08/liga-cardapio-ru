import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonContent, FormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  mode: 'login' | 'register' = 'login';
  name = ''; email = ''; password = '';
  error = ''; loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  toggle() { this.mode = this.mode === 'login' ? 'register' : 'login'; this.error = ''; }

  async submit() {
    await this.run(() => this.mode === 'login'
      ? this.auth.login(this.email, this.password)
      : this.auth.register(this.name, this.email, this.password));
  }

  async google() { await this.run(() => this.auth.google()); }

  private async run(fn: () => Promise<void>) {
    this.error = ''; this.loading = true;
    try { await fn(); await this.router.navigateByUrl('/menu', { replaceUrl: true }); }
    catch (e: any) { this.error = this.msg(e?.code); }
    finally { this.loading = false; }
  }

  private msg(code?: string) {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found': return 'E-mail ou senha inválidos';
      case 'auth/email-already-in-use': return 'E-mail já cadastrado';
      case 'auth/weak-password': return 'Senha com no mínimo 6 caracteres';
      case 'auth/invalid-email': return 'E-mail inválido';
      default: return 'Não foi possível entrar. Tente novamente.';
    }
  }
}
