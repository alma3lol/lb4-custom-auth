# Custom Authentication

[![LoopBack](https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png)](http://loopback.io/)

## Info

This project is a [LoopBack 4](https://github.com/strongloop/loopback-next) example application that uses [authentication](https://github.com/strongloop/loopback-next/tree/master/packages/authentication) package & [authentication-jwt](https://github.com/strongloop/loopback-next/tree/master/extensions/authentication-jwt) extension to add custom authentication.

## Use cases

You won't use it in every project, but this might be handy in one of these cases:
- Use as a template for a new loopback application
- Copy the needed code to add the same custom authentication to an existing app
- Learn to create your own custom authentication in loopback 4

## Usage

### As a template

Clone the project and edit as follows:
1. `src/custom-auth/Setup.ts`:
    - Line 20: Edit the datasource. (as needed)
    - Line 24: Edit the application's title. (as needed)
    - Line 37: Edit the JWT secret. (required)
2. `src/custom-auth/Types.ts`:
    - Line 12-13: Edit the credentails. (as needed)
    - Line 24,26-31: Edit the credentails' schema. (as needed)
    - Line 62: Edit returned user properties. (as needed)
3. `src/custom-auth/UserLoginService.ts`:
    - Line 22,24,30-31,36: Change username and/or password to match the previous step. (as needed)
    - Line 41-42: Edit returned user properties to match the previous step. (as needed)
4. `src/custom-auth/JWTService.ts`:
    - Line 53: Edit userprofile assembled from decrypted token to match step 2. (as needed)

### Copy the needed code

To copy the needed code to make it do it's thing, do as follows:
- Do `npm install --save @loopback/authentication @loopback/authentication-jwt @loopback/security`
- Copy the folder `src/custom-auth` to `src` folder in your application.
- Do the step 1 in [As a template](#as-a-template) section.
- Add a call to `setup` function from `src/custom-auth/Setup.ts` in `src/application.ts` as follows:
```ts
// IMPORTS
// ... SNIP ... //
import {setup} from './custom-auth';

export class MyApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    // ... SNIP ... //
    setup(this);
  }
}
```
- Copy `src/controllers/user.controller.ts` to `src/controllers` and export it within index.

### Learn the secret

Creating your own version shouldn't be hard if you read this, but I should say: **MOST OF WHAT YOU LEARN IS USELESS OUTSIDE OF ITS IMMEDIATE CONTEXT**.
If you're not going to IMMEDIATLY use what you learn here, don't waste time.

#### Things to know

At first you need to know few things:
- This code is based on official packages & extensions for loopback:
  - The code might change as the official packages & extensions change.
  - THIS IS NOT AN OFFICIAL SOLUTION.
- The code does not modify the behaviour of the authenticaion process:
  - The authentication process is the same, only the way it authenticates/verifies the user changes.
  - The value returned from `SecurityBindings.USER` is changed to `ReturnUser` from `src/custom-auth/Types.ts`.
- The code is not a package nor an extension:
  - A package/an extension is maintained by StrongLoop. This code is not.
  - A package/an extension should/will add a behaviour to your application. This code does not.
- And last...
  - The code might break your application when added. Try on a clone or with a VCS.

#### The secret

To learn the code in and out you need a loopback project & a lot of coffee.

First:
- `lb4 app` or use an existing test application.
- `npm install --save @loopback/authentication @loopback/authentication-jwt @loopback/security`

And here we go...

- The authentication process:

  LoopBack's authentication process starts with registering the component that will handle the authentication process (`AuthenticationComponent` from @loopback/authentication`):
  ```ts
  // IMPORTS
  // ... SNIP ... //
  import {AuthenticationComponent} from '@loopback/authentication';


  export class MyAuthApplication extends BootMixin(
    ServiceMixin(RepositoryMixin(RestApplication)),
  ) {
    constructor(options: ApplicationConfig = {}) {
      super(options);
      // ... SNIP ... //
      this.component(AuthenticationComponent);
    }
  }
  ```
  The way it does that isn't important to know when learning to customize the authentication/verfication of the user, so we'll leave it undetailed.
  The next step is registering the authentication strategy that will be called on endpoints that need to be secured. This step can be done via registering `JWTAuthenticationComponent` from `@loopback/authentication-jwt` which does the registering of the authentication strategy:
  ```ts
  // IMPORTS
  // ... SNIP ... //
  import {AuthenticationComponent} from '@loopback/authentication';
  import {JWTAuthenticationComponent} from '@loopback/authentication-jwt'; /* +++ */


  export class MyAuthApplication extends BootMixin(
    ServiceMixin(RepositoryMixin(RestApplication)),
  ) {
    constructor(options: ApplicationConfig = {}) {
      super(options);
      // ... SNIP ... //
      this.component(AuthenticationComponent);
      this.component(JWTAuthenticationComponent); /* +++ */
    }
  }
  ```
  Behind the scene, the `JWTAuthenticationComponent` registers the authentication strategy with the name `jwt`. This allows us to use the decorator `@authenticate('STRATEGY')` on the controller or the endpoints we want to secure.
  Q. *What is the decorator?*
  A. The decorator is a fancy looking function that changes the default behaviour of the object it decorates.
  Ex: Function `sum` take two numbers and returns a number that is the sum of them. The decorator might make it return a number that is not the expected result. And that's because it changed it's behaviour.
  Q. *How does it work?*
  A. It takes the function and replaces it's `descriptor`, which is the core behaviour the function has, and modifies it.
  Ex: Function `sum`'s `descriptor` adds the two number together and returns the result. A decorator can set the function's `descriptor` like so:
  ```ts
  const sumDecorator = (
    target: Object, // The class or the scope of the function
    methodName: string | symbol, // The name or the symbol of the function
    descriptor: TypedPropertyDescriptor<any> // The function's behaviours set
  ) => {
    // descriptor.value is the function's call behaviour
    descriptor.value = function(n1: number, n2: number) {
      return 0;
    }
  }
  ```
  This decorator will return zero no matter the number you input. Here's how it's used:
  ```ts
  @sumDecorator()
  function sum(n1: number, n2: number) {
    return n1 + n2;
  }
  console.log(sum(1, 1)); // Output: 0
  ```
  It's okay if you don't get it. Remember this: **IF YOU UNDERSTAND EVERYTHING, YOU'RE NOT LEARNING ANYTHING NEW.**

  All decorators use the same way as the above decorator to work. But it might be different based on what should it do.
  Now that we know what the decorator is and what it does, let's get to regitering the `datasource` for the `authentication strategy`:
  ```ts
  // IMPORTS
  // ... SNIP ... //
  import {AuthenticationComponent} from '@loopback/authentication';
  import {JWTAuthenticationComponent, UserServiceBindings /* +++ */ } from '@loopback/authentication-jwt';


  export class MyAuthApplication extends BootMixin(
    ServiceMixin(RepositoryMixin(RestApplication)),
  ) {
    constructor(options: ApplicationConfig = {}) {
      super(options);
      // ... SNIP ... //
      this.component(AuthenticationComponent);
      this.component(JWTAuthenticationComponent);
      // replace 'DATASOURCE' with actual datasource
      this.dataSource(DATASOURCE, UserServiceBindings.DATASOURCE_NAME); /* +++ */
    }
  }
  ```
  I'm not quite sure what the authentication strategy does with the datasource, but I'm assuming it uses it with `UserRepository`.
  Next comes registering `Security Schema Specs`:
  ```ts
  // IMPORTS
  // ... SNIP ... //
  import {AuthenticationComponent} from '@loopback/authentication';
  import {JWTAuthenticationComponent, UserServiceBindings, SECURITY_SCHEME_SPEC /* +++ */ } from '@loopback/authentication-jwt';


  export class MyAuthApplication extends BootMixin(
    ServiceMixin(RepositoryMixin(RestApplication)),
  ) {
    constructor(options: ApplicationConfig = {}) {
      super(options);
      // ... SNIP ... //
      this.component(AuthenticationComponent);
      this.component(JWTAuthenticationComponent);
      // replace 'DATASOURCE' with actual datasource
      this.dataSource(DATASOURCE, UserServiceBindings.DATASOURCE_NAME);
      this.api({                                             /* +++ */
        openapi: '3.0.0',                                    /* +++ */
        info: {                                              /* +++ */
          title: 'custom authentication application',        /* +++ */
          version: '1.0.0',                                  /* +++ */
        },                                                   /* +++ */
        paths: {},                                           /* +++ */
        components: {securitySchemes: SECURITY_SCHEME_SPEC}, /* +++ */
        security: [                                          /* +++ */
          {                                                  /* +++ */
            // secure all endpoints with 'jwt'               /* +++ */
            jwt: [],                                         /* +++ */
          },                                                 /* +++ */
        ],                                                   /* +++ */
        servers: [{url: '/'}],                               /* +++ */
      });                                                    /* +++ */
    }
  }
  ```
  This registers `Security Schema Specs`.
  The last step to be made in the application's core file is as follows:
  ```ts
  // IMPORTS
  // ... SNIP ... //
  import {AuthenticationComponent} from '@loopback/authentication';
  import {JWTAuthenticationComponent, UserServiceBindings, SECURITY_SCHEME_SPEC, TokenServiceBindings /* +++ */ } from '@loopback/authentication-jwt';
  import {UserRepository} from './repositories';           /* +++ */
  import {JWTService, UserLoginService} from './services'; /* +++ */

  export class MyAuthApplication extends BootMixin(
    ServiceMixin(RepositoryMixin(RestApplication)),
  ) {
    constructor(options: ApplicationConfig = {}) {
      super(options);
      // ... SNIP ... //
      this.component(AuthenticationComponent);
      this.component(JWTAuthenticationComponent);
      // replace 'DATASOURCE' with actual datasource
      this.dataSource(DATASOURCE, UserServiceBindings.DATASOURCE_NAME);
      this.api({
        openapi: '3.0.0',
        info: {
          title: 'custom authentication application',
          version: '1.0.0',
        },
        paths: {},
        components: {securitySchemes: SECURITY_SCHEME_SPEC},
        security: [
          {
            // secure all endpoints with 'jwt'
            jwt: [],
          },
        ],
        servers: [{url: '/'}],
      });
      // Change this to your own token secret
      app.bind(TokenServiceBindings.TOKEN_SECRET).to("JWT-SECRET-TOKEN");    /* +++ */
      // Change this to fit the need
      app.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to("12h");             /* +++ */
      app.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);      /* +++ */
      app.bind('services.user.service').toClass(UserLoginService);           /* +++ */
      app.bind(UserServiceBindings.USER_REPOSITORY).toClass(UserRepository); /* +++ */
    }
  }
  ```
  Breakdown:
  - `UserRepository`: a normal model's repository.
  - [UserLoginService](#userloginservice): the service that will verify a user's credentials and convert the user's model to [UserProfile](#userprofile).
  - [JWTService](#jwtservice): a service to generate and verify `JSON Web Token`

  ###### UserProfile

  This is the object returned with `JWT` and when using `@inject(SecurityBindings.USER)`.
  If you need to return a `username`, `FirstName`, `LastName` and 'Email`, define it as follows:
  ```ts
  type UserProfile = {
    username: string;
    FirstName: string;
    LastName: string;
    Email: string;
    [securityId]: string;
  }
  ```
  **NOTE**: `securityId` comes from `@loopback/security` and is: *A symbol for stringified id of security related objects*.

  ###### UserLoginService

  This service verifies the user's credentials upon loging in and converts it's model to [UserProfile](#userprofile).
  A sample service:
  ```ts
  import {UserService} from '@loopback/authentication';
  import {repository} from '@loopback/repository';
  import {HttpErrors} from '@loopback/rest';
  import {securityId} from '@loopback/security';
  import {compare} from 'bcryptjs';
  import {User} from '../models';
  import {UserRepository} from '../repositories';

  export type UserProfile = {
    username: string;
    FirstName: string;
    LastName: string;
    Email: string;
    [securityId]: string;
  }

  export type Credentials = {
    username: string;
    password: string;
  }

  export class UserLoginService implements UserService<User, Credentials> {
    constructor(
      @repository(UserRepository) public userRepository: UserRepository,
    ) {}

    async verifyCredentials(credentials: Credentials): Promise<User> {
      const invalidCredentialsError = 'Invalid username or password.';
      const foundUser = await this.userRepository.findOne({
        where: {username: credentials.username},
      });
      if (!foundUser) {
        throw new HttpErrors.Unauthorized(invalidCredentialsError);
      }
      const passwordMatched = await compare(
        credentials.password,
        foundUser.password,
      );
      if (!passwordMatched) {
        throw new HttpErrors.Unauthorized(invalidCredentialsError);
      }
      return foundUser;
    }

    convertToUserProfile(user: User): UserProfile {
      return {
        [securityId]: `${user.username}`,
        username: user.username,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.Email
      }
    }
  }
  ```
  This service is fully functional as it is, but you're here to understand so let's break it down:
  - `UserProfile`: the same UserProfile from [above](#userprofile).
  - `Credentials`: the credentials required to login.
  - `... implements UserService<User, Credentials> {`: UserService is a generic interface that has `U` & `C` types where:
    - `U` is the [UserModel](#usermodel).
    - `C` is the `Credentials` object.
    - `UserModel` is returned from `verifyCredentials` & used as input type in `convertToUserProfile`
    - `Credentials` is used as input type in `verifyCredentials`

  ###### JWTService

  The last service to explain is the `JWTService`: This service generates & verifies tokens.
  A sample service:
  ```ts
  import {TokenServiceBindings} from '@loopback/authentication-jwt';
  import {inject} from '@loopback/core';
  import {HttpErrors} from '@loopback/rest';
  import {securityId} from '@loopback/security';
  import {promisify} from 'util';
  const jwt = require('jsonwebtoken');
  const signAsync = promisify(jwt.sign);
  const verifyAsync = promisify(jwt.verify);

  export type UserProfile = {
    username: string;
    FirstName: string;
    LastName: string;
    Email: string;
    [securityId]: string;
  }

  export class JWTService {
    @inject(TokenServiceBindings.TOKEN_SECRET)
    public readonly jwtSecret: string;
    @inject(TokenServiceBindings.TOKEN_EXPIRES_IN)
    public readonly jwtExpiresIn: string;

    async generateToken(userProfile: UserProfile): Promise<string> {
      if (!userProfile) {
        throw new HttpErrors.Unauthorized(
          'Error while generating token : userprofile is null',
        );
      }
      let token = '';
      try {
        token = await signAsync(userProfile, this.jwtSecret, {
          expiresIn: this.jwtExpiresIn,
        });
      } catch (err) {
        throw new HttpErrors.Unauthorized(`error generating token ${err}`);
      }
      return token;
    }
    async verifyToken(token: string): Promise<UserProfile> {
      if (!token) {
        throw new HttpErrors.Unauthorized(
          `Error verifying token : 'token' is null`,
        );
      }
      let userProfile: UserProfile;
      try {
        // decode user profile from token
        const decryptedToken = await verifyAsync(token, this.jwtSecret);
        // don't copy over  token field 'iat' and 'exp' to user profile
        userProfile = Object.assign(
          {[securityId]: ''},
          {
            username: decryptedToken.username,
            FirstName: decryptedToken.FirstName,
            LastName: decryptedToken.LastName,
            Email: decryptedToken.Email
          },
        );
      } catch (error) {
        throw new HttpErrors.Unauthorized(
          `Error verifying token : ${error.message}`,
        );
      }
      return userProfile;
    }
  }
  ```
  This service has no new functionalities nor new objects to explain.
  With this service understood, let's hit the last of the `custom authentication`.

  ###### UserModel

  A normal model that represents the user entity in the business logic.
