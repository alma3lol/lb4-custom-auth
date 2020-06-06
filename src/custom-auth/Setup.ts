import {AuthenticationComponent} from '@loopback/authentication';
import {JWTAuthenticationComponent, SECURITY_SCHEME_SPEC, TokenServiceBindings, UserServiceBindings} from '@loopback/authentication-jwt';
import {DbDataSource} from '../datasources';
import {UserRepository} from '../repositories';
import {JWTService, UserLoginService} from './index';

/**
 * Setup the rest of the custom authentication
 *
 * @param app `RestApplication` instance
 *
 * Used in:
 * - `RestApplication`'s constructor
 */
export const setup = (app: any) => {
  app.component(AuthenticationComponent);
  // Mount jwt component
  app.component(JWTAuthenticationComponent);
  // Bind datasource
  app.dataSource(DbDataSource, UserServiceBindings.DATASOURCE_NAME);
  app.api({
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
  app.bind(TokenServiceBindings.TOKEN_SECRET).to("JWT-SECRET-TOKEN"); // TODO: CHANGE THIS
  app.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to("12h");
  app.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);
  app.bind('services.user.service').toClass(UserLoginService); // To avoid error in different return type of function 'verifyCredentials'
  app.bind(UserServiceBindings.USER_REPOSITORY).toClass(UserRepository);
}
