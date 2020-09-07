/**
 * VOBE AUTHENTIFICATION SERVICE
 * v1.0
 */

export interface SigninReq {
  username: string;
  password: string;
}

export interface SignupReq {
  username: string;
  email: string;
  password: string;
}

export interface AuthProps {}

export interface AuthStatus {
  Success: boolean;
  Code: number;
  Content: string;
}

interface AuthSates {
  signin: AuthState;
  signup: AuthState;
}

type ReqState = 'IDLE' | 'AWAITING' | 'SUCCESS' | 'FAILED';

class AuthState {
  private state: ReqState;
  private listeners: ((oldState: ReqState, newState: ReqState) => void)[];

  constructor(state: ReqState = 'IDLE') {
    this.state = state;
    this.listeners = [];
  }

  public setState(state: ReqState) {
    this.listeners.forEach((clb) => clb(this.state, state));
    this.state = state;
  }

  public getState(): ReqState {
    return this.state;
  }

  public onStateChange(clb: (oldState: ReqState, newState: ReqState) => void) {
    this.listeners.push(clb);
  }
}

export default class AuthHandler {
  private props: AuthProps;
  public authStates: AuthSates;
  public isLoggedIn: boolean;
  private token?: string;

  constructor(props: AuthProps) {
    this.token = this.getToken() ?? undefined;
    this.isLoggedIn = this.token !== null && this.token !== undefined;
    this.props = props;
    this.authStates = {
      signin: new AuthState(),
      signup: new AuthState(),
    };

    this.authStates.signin.onStateChange((o, n) => {
      if (!(o === 'AWAITING' && n === 'SUCCESS')) return;
    });
  }

  private POST<T>(obj: T, url: string): Promise<AuthStatus> {
    return new Promise<AuthStatus>((resolve, reject) => {
      console.log(this.getURL());
      return fetch(url, {
        method: 'POST',
        body: JSON.stringify(obj),
      })
        .then((res) => res.json())
        .then((res) => resolve(res as AuthStatus))
        .catch((err) => reject(err));
    });
  }

  private getToken(): string | null {
    return localStorage.getItem('session-token');
  }

  private setToken(token: string) {
    localStorage.setItem('session-token', token);
  }

  private isDevMode(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  private getURL(...urls: string[]): string {
    return this.isDevMode()
      ? `${window.location.protocol}//${
          window.location.hostname
        }:8080/${urls.join('/')}`
      : `https://auth.vobe.io/${urls.join('/')}`;
  }

  public signin(loginReq: SigninReq): Promise<AuthStatus> {
    if (this.isLoggedIn)
      return new Promise((_, rej) => rej('already logged in'));
    let req = this.POST<SigninReq>(loginReq, this.getURL() + 'signin');

    this.authStates.signin.setState('AWAITING');
    req.then((res) => {
      console.log('OBTAINED TOKEN: ', res.Content);
      this.setToken(res.Content);
      this.token = res.Content;
      this.isLoggedIn = true;
      this.authStates.signin.setState('SUCCESS');
    });
    req.catch(() => this.authStates.signin.setState('FAILED'));
    req.finally(() => this.authStates.signin.setState('IDLE'));
    return req;
  }

  public signup(signupReq: SignupReq): Promise<AuthStatus> {
    let req = this.POST<SignupReq>(signupReq, this.getURL() + 'signup');

    this.authStates.signup.setState('AWAITING');
    req
      .then(() => this.authStates.signup.setState('SUCCESS'))
      .catch(() => this.authStates.signup.setState('FAILED'))
      .finally(() => this.authStates.signup.setState('IDLE'));
    return req;
  }
}
