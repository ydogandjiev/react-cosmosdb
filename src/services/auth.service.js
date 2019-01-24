import AuthenticationContext from "adal-angular/lib/adal";

// An authentication service that uses the ADAL.js library to sign in users with
// an AAD account. This leverages the AAD v1 endpoint.
class AuthService {
  constructor() {
    this.applicationConfig = {
      clientId: "47c4b867-f50e-44fa-ae29-bfa3574d48ce",
      endpoints: {
        api: "47c4b867-f50e-44fa-ae29-bfa3574d48ce"
      },
      cacheLocation: "localStorage",
      callback: this.loginCallback,
      popUp: true
    };

    this.authContext = new AuthenticationContext(this.applicationConfig);
  }

  isCallback = () => {
    return this.authContext.isCallback(window.location.hash);
  };

  loginCallback = (reason, token, error) => {
    if (this.loginPromise) {
      if (!error) {
        this.getUser()
          .then(user => this.loginPromiseResolve(user.profile))
          .catch(error => {
            this.loginPromiseReject(error);
          });
      } else {
        this.loginPromiseReject(`${error}: ${reason}`);
      }
    }
  };

  login = () => {
    if (!this.loginPromise) {
      this.loginPromise = new Promise((resolve, reject) => {
        // Allow the promise to be resolved/rejected from the loginCallback above
        this.loginPromiseResolve = resolve;
        this.loginPromiseReject = reject;

        // Start the login flow
        this.authContext.login();
      });
    }
    return this.loginPromise;
  };

  logout = () => {
    this.authContext.logOut();
  };

  getUser = () => {
    return new Promise((resolve, reject) => {
      this.authContext.getUser((error, user) => {
        if (!error) {
          resolve(user);
        } else {
          reject(error);
        }
      });
    });
  };

  getToken = () => {
    return new Promise((resolve, reject) => {
      this.authContext.acquireToken(
        this.applicationConfig.endpoints.api,
        (reason, token, error) => {
          if (!error) {
            resolve(token);
          } else {
            reject({ error, reason });
          }
        }
      );
    });
  };

  // Does an authenticated fetch by acquiring and appending the Bearer token for our backend
  fetch = (url, options) => {
    return this.getToken().then(token => {
      options = options || {};
      options.headers = options.headers || {};
      options.headers.Authorization = `Bearer ${token}`;
      return fetch(url, options);
    });
  };
}

export default new AuthService();
